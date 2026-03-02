import moment from 'moment'
import i18next from '../../locales'
import { action, observable, computed, runInAction, toJS } from 'mobx'
import {
  getSumTrHeight,
  isMultiTable,
  getArrayMid,
  caclRowSpanTdPageHeight,
  caclSingleDetailsPageHeight,
  getOverallOrderTrHeight,
  getDataKey,
  getAutoFillingConfig,
  coverDigit2Uppercase,
  addMomentDay
} from '../util'
import _ from 'lodash'
import batchPrinterStore from './batch_printer_store'
import Big from 'big.js'

export const TR_BASE_HEIGHT = 23
const price = (n, f = 2) => {
  /** 有些价格会有...,传给Big会报错，那么替换掉 */
  if (typeof n === 'string') {
    n = n.replace(/\.+$/, '')
  }
  // 自定义函数支持多栏
  if (n === undefined || n === '') return ''
  return Big(n || 0).toFixed(f)
}
const diyRandom = (a, b, c = 2) => {
  return (a + Math.random() * (b - a)).toFixed(c)
}
const parseFloatFun = a => {
  // 自定义函数支持多栏
  if (a === '' || a === undefined) return ''
  return parseFloat(+a)
}

const coverParseFloat = num => {
  if (num === '' || num === undefined || num === null) return ''
  return parseFloat(num)
}

/**
 *
 * @param num 处理小数点末尾零
 * @returns
 */
function removeTrailingZeros(str) {
  const toString = String(str)
  return toString.replace(
    /(\d+(?:\.\d+)?)0*([^\d]*)/g,
    (match, number, unit) => {
      // 使用parseFloat自动处理，然后转回字符串
      return parseFloat(number) + (unit || '')
    }
  )
}

/** @description 这个使用来计算的 只能debugger一层一层看  我真的是醉掉😤 */
class PrinterStore {
  constructor(batchKey) {
    if (batchKey !== undefined) {
      this.batchKey = batchKey
    }
  }

  @observable batchKey = undefined

  @observable ready = false

  /**
   * 需要等待table渲染完毕才能计算
   */
  // eslint-disable-next-line
  @observable tableReady = {}

  // eslint-disable-next-line
  @observable config = {}
  // eslint-disable-next-line
  @observable pageHeight = {}
  // eslint-disable-next-line
  @observable height = {}

  @observable contents = []
  // eslint-disable-next-line
  @observable tablesInfo = {}

  @observable pages = [] // [{type, index, begin, end}]

  @observable hiddenPages4CombineTable = []

  @observable showCombineSkuDetail = false

  @observable showIngredientDetail = false
  /** 当前页剩余空白高度 */
  @observable remainPageHeight = 0

  data = {}

  // 需要存一下 table 最后的行数，双栏的时候要用到
  // eslint-disable-next-line gmfe/no-observable-empty-object
  @observable lastTableCellCount = {}

  // 选中某个东西，具体见 edit/store.js 定义
  @observable
  selected = null

  // 选择中区域
  @observable
  selectedRegion = null

  // 是否自动行数填充
  @observable
  isAutoFilling = false

  @observable
  isInPrint = false

  @action
  init(config, data) {
    this.ready = false
    this.config = config
    this.height = {}
    this.contents = []
    this.tablesInfo = {}
    this.pages = [] // [page, page, ...] page 为数组
    this.data = data
    this.selected = null
    this.showCombineSkuDetail = config?.combineSkuDetail?.show || false
    this.showIngredientDetail = config?.ingredientDetail?.show || false
    this.tableReady = {}
    config.contents.map((v, index) => {
      if (v.type === 'table') {
        this.tableReady[`contents.table.${index}`] = false
      }
    })
  }

  @action
  setAutofillConfig(bol) {
    this.isAutoFilling = bol
  }

  @action
  setLinesPerPage(linesPerPage) {
    this.linesPerPage = linesPerPage
  }

  @action
  setOverallOrder(config) {
    this.config = config || {}
  }

  @action
  setData(data) {
    this.data = data
  }

  @action
  setPageHeight(height) {
    this.pageHeight = height
  }

  @action
  setHeight(who, height) {
    this.height[who] = height
  }

  @action
  setTable(name, table) {
    this.tablesInfo = {
      ...this.tablesInfo,
      [name]: table
    }
  }

  @action
  setReady(ready) {
    this.ready = ready
  }

  @action
  setTableReady(name, ready) {
    this.tableReady = {
      ...this.tableReady,
      [name]: ready
    }
  }

  @action
  setIsInPrint(isInPrint) {
    this.isInPrint = isInPrint || false
  }

  @computed
  get isDeliverType() {
    return this.config.isDeliverType
  }

  @computed
  get tableVerticalStyle() {
    return this.config.tableVerticalStyle || 'leftToRight'
  }

  @computed
  get isFirstLeftThenRight() {
    return this.tableVerticalStyle === 'firstLeftThenRight'
  }

  // 是否是根据单据计算页数
  @computed
  get isPrintedPageOrderAndTotal() {
    return this.batchKey !== undefined && this.config.printedPageOrderAndTotal
  }

  get tableConfig() {
    const { autoFillConfig } = this.config
    const isAutoFilling =
      getAutoFillingConfig(autoFillConfig?.checked) !== 'manual'
    if (!this.selectedRegion && !isAutoFilling) return null
    const _selectedRegion = this.selectedRegion || autoFillConfig.region || ''
    const arr = _selectedRegion.split('.')
    const tableConfig = this.config.contents[arr[2]]

    if (!_.has(tableConfig, 'dataKey')) return null
    return tableConfig
  }

  get tableData() {
    if (!this.tableConfig) return []
    const { autoFillConfig } = this.config
    const { dataKey } = this.tableConfig
    if (autoFillConfig?.region) {
      /** 当前数据 */
      return this.data._table[dataKey] || []
    }
    if (!this.selectedRegion) return []

    /** 当前数据 */
    return this.data._table[dataKey] || []
  }

  // 空数据的长度
  get filledTableLen() {
    const filledData = this.tableData.filter(x => x._isEmptyData)
    return filledData.length
  }

  // 获得表格自定义行高
  @computed
  get computedTableCustomerRowHeight() {
    const _defaultRegion = this.config?.autoFillConfig?.region
    if (this.selectedRegion || _defaultRegion) {
      const _selectedRegion = this.selectedRegion || _defaultRegion
      const arr = _selectedRegion.split('.')
      if (arr.includes('table')) {
        const height = this.config.contents[arr[2]].customerRowHeight
        return height === undefined ? 23 : height
      }
    }
    return 23
  }

  @action
  setSelected(selected) {
    this.selected = selected || null
  }

  @action
  setSelectedRegion(selected) {
    this.selectedRegion = selected || null
  }

  getNormalTableBodyHeights(heights, dataKey) {
    if (!this.tableConfig) return heights

    const len = this.data._table[dataKey].length
    // 如果是已经开了填充配置，回显的heights包括了填充的表格部分，关闭配置时，这种情况就要去掉填充的
    if (_.gt(heights.length, len)) return heights.slice(0, len)

    const hasEmptyData = this.tableData.some(x => x._isEmptyData)
    const isOrderCategroy = dataKey === this.config?.autoFillConfig?.dataKey
    const { customerRowHeight = TR_BASE_HEIGHT } = this.tableConfig

    const isAutoFillingBool =
      getAutoFillingConfig(this.isAutoFilling) !== 'manual'

    if (hasEmptyData && !isAutoFillingBool && isOrderCategroy) {
      // 如果tableData有填充的空数据， 则去掉
      return heights.slice(0, -this.filledTableLen)
    } else if (isAutoFillingBool && isOrderCategroy) {
      // 如果没有空数据，且isAutofilling是true,即选择了要填充数据
      return [
        ...heights,
        ...Array(this.filledTableLen).fill(_.toNumber(customerRowHeight))
      ]
    } else {
      // 正常情况
      return heights
    }
  }

  @action
  setShowCombineSkuDetail(boo) {
    this.showCombineSkuDetail = boo
  }

  @action
  setShowIngredientDetail(boo) {
    this.showIngredientDetail = boo
  }

  @action
  computedData(dataKey, table, end, currentRemainTableHeight) {
    /** 当前数据 */
    const tableData = this.data._table[dataKey].slice() || []
    let count = 0
    _.forEach(Array(end).fill(1), (val, i) => {
      const details = tableData[i]?.__details || []
      count += details.length
    })

    /** 明细data */
    const detailsData = tableData[end]?.__details
    // 如果没有details 和 明细不换行, 就不用计算了

    if (!detailsData || dataKey.includes('noLineBreak')) {
      return []
    }
    const detailsHeights = table.body.children?.slice(
      count,
      count + detailsData.length
    )
    const { ranges, detailsPageHeight } = caclSingleDetailsPageHeight(
      detailsHeights,
      currentRemainTableHeight
    )
    // 分局明细拆分后的数据
    const splitTableData = _.map(ranges, range => {
      const _tableData = Object.assign({}, tableData[end])

      _tableData.__details = detailsData.slice(...range)
      return _tableData
    })

    // 插入原table数据中
    tableData.splice(end, 1, ...splitTableData)
    this.data._table[dataKey] = tableData
    return detailsPageHeight
  }

  @action
  computedPages() {
    // 每次先初始化置空
    this.pages = []
    const isAutoFillingAuto =
      getAutoFillingConfig(this.isAutoFilling) !== 'manual'
    // 每页必有 页眉header, 页脚footer , 签名
    const allPagesHaveThisHeight = this.height.header + this.height.footer

    // 退出计算! 因为页眉 + 页脚 > currentPageHeight,页面装不下其他东西
    if (allPagesHaveThisHeight > this.pageHeight) {
      return
    }

    /** 某一page的累积已填充的高度 */
    let currentPageHeight = allPagesHaveThisHeight
    // 当前在处理 contents 的索引
    let index = 0
    /** 一页承载的内容. [object, object, ...] */
    let page = []
    /** 处理配送单有多个表格的情况 */
    let tableCount = 0

    /* --- 遍历 contents,将内容动态分配到page --- */
    while (index < this.config.contents.length) {
      const content = this.config.contents[index]
      /* 表格内容处理 */
      if (content.type === 'table') {
        /**
         * 判断组合商品表格,
         * 因为写死了两个固定的content，页码计算要处理一下
         */
        if (content.id === 'combine' && !this.showCombineSkuDetail) {
          index++
          continue
        }
        if (
          content?.id === 'combine' &&
          this.showCombineSkuDetail &&
          ((this.showIngredientDetail &&
            content?.dataKey === 'combine_withoutIg') ||
            (!this.showIngredientDetail &&
              content?.dataKey === 'combine_withIg'))
        ) {
          index++
          continue
        }
        tableCount++
        // 表格原始的高度和宽度信息
        const table = this.tablesInfo[`contents.table.${index}`]

        const {
          arrange,
          subtotal,
          allOrderSummaryConfig,
          dataKey,
          /** 本页小计 or 每页合计 */
          summaryConfig,
          overallOrder
        } = content

        const isMultiPage = dataKey?.includes('multi')
        // 如果显示每页合计,那么table高度多预留一行高度
        const subtotalTrHeight = subtotal.show ? getSumTrHeight(subtotal) : 0
        let allOrderSummaryTrHeight = allOrderSummaryConfig?.isShowOrderSummaryPer
          ? getSumTrHeight(allOrderSummaryConfig) + 5
          : 0
        if (content?.isShowAllOrderSummaryPer) {
          allOrderSummaryTrHeight += getSumTrHeight(allOrderSummaryConfig) + 5
        }

        // 如果显示整单合计,那么table高度多预留一行高度
        const overallOrderTrHeight = overallOrder?.show
          ? getOverallOrderTrHeight(overallOrder)
          : 0
        // 如果每页合计(新的),那么table高度多预留一行高度
        const pageSummaryTrHeight = summaryConfig?.pageSummaryShow
          ? getSumTrHeight(summaryConfig)
          : 0

        const tableHeadHeight = table.head.height
        // 每个表格都具有的高度
        const allTableHaveThisHeight =
          tableHeadHeight +
          subtotalTrHeight +
          pageSummaryTrHeight +
          overallOrderTrHeight +
          allOrderSummaryTrHeight

        /** 当前page页面的最小高度 */
        const currentPageMinimumHeight =
          allPagesHaveThisHeight + allTableHaveThisHeight
        /** 当前page可容纳的table高度 */
        let pageAccomodateTableHeight = +new Big(this.pageHeight)
          .minus(currentPageHeight)
          .toFixed(2)

        let heights = this.getNormalTableBodyHeights(
          table.body.heights,
          dataKey
        )
        if (this.isDeliverType) {
          heights = [
            ...this.getNormalTableBodyHeights(
              table.body.heights,
              getDataKey(dataKey, arrange, this.tableVerticalStyle)
            )
          ]
        }
        let heightsLength = heights.length
        let isShowOrderSummary = false
        let isShowAllOrderSummary = false
        /** 开启整页合计 且整页合计是每页显示 */
        if (
          allOrderSummaryConfig?.orderSummaryShow &&
          allOrderSummaryConfig?.isShowOrderSummaryPer
        ) {
          /** 这里不用减，好像有点奇怪 */
          if (summaryConfig.showPageType === 'bottom') {
            // 如果开了整单合计，但没开每页整单合计，并且显示每页合计，那么height = 1
            if (pageSummaryTrHeight && heightsLength >= 2) {
              heightsLength = heightsLength - 1
              isShowOrderSummary = true
            }
          }
          if (allOrderSummaryConfig.showOrderType === 'bottom') {
            if (allOrderSummaryTrHeight && heightsLength >= 2) {
              heightsLength = heightsLength - 1
              isShowAllOrderSummary = true
            }
          }
        } else if (allOrderSummaryConfig?.orderSummaryShow) {
          /** 整单合计，不是是每页显示整单合计且在每页底部显示 且开启每页显示在每页底部显示 */
          if (
            !allOrderSummaryConfig?.isShowOrderSummaryPer &&
            summaryConfig.showPageType === 'bottom'
          ) {
            // 如果开了整单合计，但没开每页整单合计，并且显示每页合计，那么height = 1
            if (pageSummaryTrHeight && heightsLength >= 2) {
              heightsLength = heightsLength - 1
              isShowOrderSummary = true
            }
          }
        } else if (summaryConfig?.pageSummaryShow) {
          /** 每页合计， 在每页底部显示 */
          if (summaryConfig.showPageType === 'bottom') {
            // 如果开了每页合计，并且显示每页合计，那么height = 1
            if (pageSummaryTrHeight && heightsLength >= 2) {
              heightsLength = heightsLength - 1
              isShowOrderSummary = true
            }
          }
        }

        // 表格行的索引,用于table.slice(begin, end), 分割到不同页面中
        let begin = 0
        let end = 0
        // 如果表格没有数据,那么轮一下个content
        if (heightsLength <= 0) {
          index++
        } else {
          /** 仅计算当前页table的累积高度 */
          let currentTableHeight = allTableHaveThisHeight
          // 表格有数据,添加[每个表格都具有的高度]
          currentPageHeight += allTableHaveThisHeight
          /** 去最小的tr高度，用于下面的计算compare,(避免特殊情况：一般来说最小tr——height = 23, 比23还小的不考虑计算) */
          const minHeight = Math.max(getArrayMid(heights), 23)

          if (this.isDeliverType) {
            // 是否不显示 table header
            const isHiddenTableHeader = this.config.isPrintTableHeader === false
            // 如果设置了linesPerPage，则只填充linesPerPage行
            const linesPerPage = this.config.linesPerPage
              ? Number(this.config.linesPerPage)
              : undefined
            // 页面 cell 数
            // eslint-disable-next-line no-unused-vars
            const pageCellCounts = []
            // eslint-disable-next-line no-unused-vars
            const tableCellCounts = []
            const isVertical =
              isMultiPage && arrange === 'vertical' && this.isFirstLeftThenRight
            // 当前真实的 cell index
            // eslint-disable-next-line no-unused-vars
            let cellIndex = 0
            // 当前 table 渲染了多少行
            let tableCellCount = 0
            // 当前 table 分了几页
            let pageIndex = 0
            // 上一页的 table 渲染了几行
            let lastPageTableCellCount = 0
            // 截止到上一页的总行数
            // eslint-disable-next-line no-unused-vars
            let lastPageTableCellCountAll = 0
            // 正确的 begin, 用于双栏纵向情况
            let trueBegin = 0
            let dataIndex = heightsLength
            // 如果需要自动填充的话，需要计算一下填充行数
            let dataHeights = [...heights]
            const cumputeDataIndexAndDataHeights = () => {
              if (isAutoFillingAuto && linesPerPage) {
                // 如果填写了linesPerPage && isAutoFillingAuto
                // 那要把 dataIndex 给填满到 linesPerPage
                const maxPageIndex = Math.ceil(dataIndex / linesPerPage)
                dataIndex = +maxPageIndex * +linesPerPage
                if (isVertical) {
                  dataIndex =
                    Math.ceil(dataIndex / (linesPerPage * 2)) *
                    +(linesPerPage * 2)
                  dataHeights = [...heights]
                }
                // const maxPageIndex = Math.ceil(heights.length / linesPerPage)
                // dataIndex = +maxPageIndex * +linesPerPage
              }
            }
            cumputeDataIndexAndDataHeights()

            // 完成页面后
            const tablePageComplete = () => {
              cellIndex = 0
              pageCellCounts.push(lastPageTableCellCount)

              // 开启新一页,重置页面高度
              pageAccomodateTableHeight = +new Big(this.pageHeight).minus(
                allPagesHaveThisHeight
              )
              currentTableHeight = allTableHaveThisHeight
              currentPageHeight = currentPageMinimumHeight
              // 这边如果说隐藏了 header 需要减去 header 的高度
              if (isHiddenTableHeader) {
                currentPageHeight -= tableHeadHeight
              }
            }
            const onLinePerPageComplete = () => {
              tableCellCounts.push(tableCellCount)
            }

            /* 遍历表格每一行，填充表格内容 */
            // 防止高度过小导致死循环的保护
            let deliverTableIteration = 0
            const MAX_DELIVER_TABLE_ITERATIONS = Math.max(
              dataIndex * 10 + 1000,
              10000
            )
            while (dataIndex > end) {
              deliverTableIteration++
              if (deliverTableIteration > MAX_DELIVER_TABLE_ITERATIONS) {
                console.warn('分页计算超过最大迭代次数，可能纸张高度过小')
                break
              }
              if (end > dataIndex) {
                break
              }

              const trueIndex = end - trueBegin
              let trHeight = dataHeights[end] || 24
              if (isVertical) {
                trHeight = Math.max(
                  dataHeights[trueIndex] || minHeight,
                  minHeight
                )
              }

              // 真实的 end 值

              // 当前页没有多余空间
              // 双栏 & 垂直的话，只判断一次就好了，不需要每次都判断
              currentTableHeight += trHeight
              // 用于计算最后一页有footer情况的高度
              currentPageHeight += trHeight
              // 当前页数，5-0,11-5
              const pageSize = end - begin
              // 当前页 table 的 cell 数
              let currentPageTableCellCount = pageSize

              // 如果设置了linesPerPage，那么不允许一页的 cell 超过linesPerPage
              if (linesPerPage) {
                currentPageTableCellCount =
                  pageSize > linesPerPage ? linesPerPage : pageSize
              }
              // 渲染一行
              tableCellCount++

              if (currentTableHeight > pageAccomodateTableHeight) {
                const overHeight = dataHeights[end] || 24
                // 双栏合计
                if (isMultiPage && !isVertical && subtotal.show) {
                  /** 正是因为添加了这一行，所以超过了 */
                  // 因为超过，所以要退回上一个
                  end--
                }
                /** 当前页table渲染完后剩余的高度 */
                const currentRemainTableHeight = +Big(pageAccomodateTableHeight)
                  .minus(currentTableHeight)
                  .plus(overHeight)

                /**
                 * 说明： 1. currentRemainTableHeight至少要是minHeight的 2倍，不然每次到这都进入if，同时留下一点空白距离
                 * 2. heights[end]至少要是currentRemainTableHeight的 1倍，怕出现打印时最后一行文字显示一半的情况
                 * 3. heights[end] 高度超过了 pageAccomodateTableHeight
                 */
                if (
                  (currentRemainTableHeight / minHeight > 1.5 &&
                    overHeight / currentRemainTableHeight > 1) ||
                  overHeight > pageAccomodateTableHeight
                ) {
                  // debugger
                  if (currentRemainTableHeight >= 23) {
                    const detailsPageHeight = this.computedData(
                      dataKey,
                      table,
                      end,
                      currentRemainTableHeight
                    )
                    // 拆分明细后，同时也要更新body.heights 不能影响后续计算
                    if (detailsPageHeight.length > 0) {
                      // 比较剩余高度和minHeight的大小，取最大（防止剩余一条明细时，第二页撑开的高度远大于一条明细的高度）
                      detailsPageHeight[1] = Math.max(
                        minHeight,
                        detailsPageHeight[1]
                      )
                      heights.splice(end, 1, ...detailsPageHeight)
                      dataHeights.splice(end, 1, ...detailsPageHeight)
                      end++
                    }
                  }
                }
                const nowPage = {
                  type: 'table',
                  index,
                  begin,
                  trueBegin,
                  pageIndex,
                  size: currentPageTableCellCount,
                  linesPerPage,
                  end
                }
                // 第一条极端会有问题
                if (end !== 0) {
                  page.push(nowPage)
                  lastPageTableCellCount = nowPage.size
                  lastPageTableCellCountAll += lastPageTableCellCount
                  // 此页完成任务
                  this.pages.push(page)
                  page = []
                  pageIndex++
                  tablePageComplete()
                }
                // 页面有多个表格时，当同一页的第二个表格的第一行高度加上第一个表格的高度大于页面的高度，需要生成新的一页
                // 因为是第二个表格，重新走了遍历，end重置0，没有进入到上面的判断（end !== 0），不会生成新的一页
                if (tableCount > 1 && end === 0) {
                  this.pages.push(page)
                  page = []
                  pageIndex++
                  tablePageComplete()
                }
                trueBegin = trueBegin + currentPageTableCellCount
                // 这里如果已经超限了，重置一下行数
                if (linesPerPage && tableCellCount - 1 > linesPerPage) {
                  tableCellCount = 0
                } else {
                  tableCellCount--
                }
                if (isVertical) {
                  end = end + lastPageTableCellCount
                  // if (linesPerPage) {
                  //   end++
                  // }
                  if (end > dataIndex) {
                    end = dataIndex
                  }
                  begin = end
                  if (end >= dataIndex) {
                    runInAction(() => {
                      this.lastTableCellCount[`contents.table.${index}`] =
                        Number(nowPage.size) + Number(nowPage.trueBegin)
                    })
                    index++
                  }
                } else {
                  begin = end
                }
              } else {
                end++
                cellIndex++
                const isEnd = end >= dataIndex
                // 最后一行，把信息加入 page，并轮下一个contents
                if (isEnd) {
                  let nowPageSize =
                    end - begin > linesPerPage ? linesPerPage : end - begin
                  if (isVertical) {
                    nowPageSize = currentPageTableCellCount + 1
                  }
                  const nowPage = {
                    type: 'table',
                    index,
                    begin,
                    trueBegin,
                    pageIndex,
                    size: nowPageSize,
                    // 最后一页的 end 要+1
                    end: end
                  }
                  page.push(nowPage)
                  lastPageTableCellCount = nowPage.size
                  lastPageTableCellCountAll += lastPageTableCellCount
                  this.lastTableCellCount[`contents.table.${index}`] =
                    Number(nowPage.size) + Number(nowPage.trueBegin)
                  index++
                } else {
                  // 只需要在超过了linesPerPage的情况下，就创建一个新的page，并且将当前的page的数据拼接到新的page中
                  if (
                    linesPerPage &&
                    tableCellCount === linesPerPage &&
                    this.isDeliverType
                  ) {
                    // 当前的 page 和 linesPerPage 应该都等于 linesPerPage
                    const nowPageSize =
                      end - begin > linesPerPage ? linesPerPage : end - begin
                    // if (begin !== 0) {
                    //   nowPageSize++
                    // }
                    const nowPage = {
                      type: 'table',
                      index,
                      begin,
                      trueBegin,
                      pageIndex,
                      size: nowPageSize,
                      end: end
                    }
                    if (isVertical) {
                      if (!linesPerPage) {
                        trueBegin++
                      }
                    }
                    if (isMultiPage && isVertical) {
                      lastPageTableCellCount = nowPage.size
                      end = end + lastPageTableCellCount
                      if (end > dataIndex) {
                        end = dataIndex
                      }
                      begin = end
                    }
                    if (end >= dataIndex) {
                      if (isVertical) {
                        nowPage.end = dataIndex
                        if (linesPerPage) {
                          nowPage.size = nowPageSize
                        }
                      }
                      page.push(nowPage)
                      // nowPage.size = trueBegin - nowPage.trueBegin
                      this.lastTableCellCount[`contents.table.${index}`] =
                        Number(nowPage.size) + Number(nowPage.trueBegin)
                      index++
                    } else {
                      // 超限之后新建一页
                      page.push(nowPage)
                      lastPageTableCellCount = nowPage.size
                      // 重新开始
                      if (!isVertical) {
                        begin = nowPage.end
                      }
                      trueBegin = trueBegin + nowPageSize
                      // 此页完成任务
                      this.pages.push(page)
                      page = []
                      pageIndex++
                      tablePageComplete()
                    }
                    // 分页完成
                    onLinePerPageComplete()
                    tableCellCount = 0
                    // return
                  }
                }
              }
            }
          } else {
            if (heightsLength === 0) {
              index++
              continue
            }
            /* 遍历表格每一行，填充表格内容 */
            // 防止高度过小导致死循环的保护
            let normalTableIteration = 0
            const MAX_NORMAL_TABLE_ITERATIONS = Math.max(
              heightsLength * 10 + 1000,
              10000
            )
            while (end < heightsLength) {
              normalTableIteration++
              if (normalTableIteration > MAX_NORMAL_TABLE_ITERATIONS) {
                console.warn('分页计算超过最大迭代次数，可能纸张高度过小')
                break
              }
              currentTableHeight += heights[end]
              // 用于计算最后一页有footer情况的高度
              currentPageHeight += heights[end]
              // 当前页没有多余空间
              if (currentTableHeight > pageAccomodateTableHeight) {
                const overHeight = heights[end]
                // 双栏合计
                if (dataKey?.includes('multi')) {
                  /** 正是因为添加了这一行，所以超过了 */
                  // 因为超过，所以要退回上一个
                  end--
                }
                /**
                 * 当前页table渲染完后剩余的高度？？
                 * 这里计算有点诡异，当前table的高度 < 可容纳高度的话， 才有剩余的table高度吧
                 * 如果当前table的高度 > 可容纳高度的话， 那么剩余的高度都直接是负数了，可以直接开下一页了吧
                 */
                const currentRemainTableHeight = +Big(pageAccomodateTableHeight)
                  .minus(currentTableHeight)
                  .plus(overHeight)

                /**
                 * 说明： 1. currentRemainTableHeight至少要是minHeight的 2倍，不然每次到这都进入if，同时留下一点空白距离
                 * 2. heights[end]至少要是currentRemainTableHeight的 1倍，怕出现打印时最后一行文字显示一半的情况
                 * 3. heights[end] 高度超过了 pageAccomodateTableHeight
                 * 4. 如果当前table 都要比可容纳的高度都要高，那么也要进入分割明细中
                 */
                if (
                  (currentRemainTableHeight / minHeight > 1.5 &&
                    overHeight / currentRemainTableHeight > 1) ||
                  overHeight > pageAccomodateTableHeight ||
                  currentTableHeight > pageAccomodateTableHeight
                ) {
                  // debugger
                  if (currentRemainTableHeight >= 23) {
                    const detailsPageHeight = this.computedData(
                      dataKey,
                      table,
                      end,
                      currentRemainTableHeight
                    )
                    // 拆分明细后，同时也要更新body.heights 不能影响后续计算
                    if (detailsPageHeight.length > 0) {
                      /**  如果当前table 都要比可容纳的高度都要高， 那么他的值应该改成详情高度，以为详情被分割了 */
                      if (currentTableHeight > pageAccomodateTableHeight) {
                        heights.splice(end, 1, ...detailsPageHeight)
                      } else {
                        // 比较剩余高度和minHeight的大小，取最大（防止剩余一条明细时，第二页撑开的高度远大于一条明细的高度）
                        detailsPageHeight[1] = Math.max(
                          minHeight,
                          detailsPageHeight[1]
                        )
                      }
                      end++
                    }
                  }
                }
                // 第一条极端会有问题
                if (end !== 0) {
                  page.push({
                    type: 'table',
                    index,
                    begin,
                    end
                  })
                  // 此页完成任务
                  this.pages.push(page)
                  page = []
                }
                // 页面有多个表格时，当同一页的第二个表格的第一行高度加上第一个表格的高度大于页面的高度，需要生成新的一页
                // 因为是第二个表格，重新走了遍历，end重置0，没有进入到上面的判断（end !== 0），不会生成新的一页
                if (tableCount > 1 && end === 0) {
                  this.pages.push(page)
                  page = []
                }

                begin = end
                // 开启新一页,重置页面高度
                pageAccomodateTableHeight = +new Big(this.pageHeight).minus(
                  allPagesHaveThisHeight
                )
                currentTableHeight = allTableHaveThisHeight
                currentPageHeight = currentPageMinimumHeight
              } else {
                // 有空间，继续做下行
                end++
                // 最后一行，把信息加入 page，并轮下一个contents
                if (end === heightsLength) {
                  page.push({
                    type: 'table',
                    index,
                    begin,
                    end
                  })
                  index++
                }
              }
              heightsLength = heights.length
              if (isShowOrderSummary) {
                heightsLength--
              }
              if (isShowAllOrderSummary) {
                heightsLength--
              }
            }
          }
        }
        /* 非表格内容处理 */
      } else {
        const panelHeight = this.height[`contents.panel.${index}`]
        currentPageHeight += panelHeight
        // 当 panel + allPagesHaveThisHeight > 页高度, 停止. 避免死循环
        if (panelHeight + allPagesHaveThisHeight > this.pageHeight) {
          break
        }
        // 如果是最后一页，必须要加上sign的高度，否则会重叠， 从外面移了进来
        const isLastContent = index === this.config.contents.length - 1

        // 如果是最后一个模块，需要加上 sign 的高度
        if (isLastContent) {
          currentPageHeight += this.height?.sign || 0
        }

        if (currentPageHeight <= this.pageHeight) {
          // 空间充足，把信息加入 page，并轮下一个contents
          page.push({
            type: 'panel',
            index
          })

          index++
        } else {
          // 此页空间不足，创建新页面并把当前 panel 放到新页面
          this.pages.push(page)
          page = [{ type: 'panel', index }]
          currentPageHeight = allPagesHaveThisHeight + panelHeight
          index++
        }
      }
    }
    this.pages.push(page)

    const safeCurrentPageHeight = Number.isNaN(currentPageHeight)
      ? 0
      : currentPageHeight
    this.remainPageHeight = +Big(
      this.pageHeight - safeCurrentPageHeight
    ).toFixed(0)

    if (this.batchKey !== undefined) {
      batchPrinterStore.setPageSizes(this.batchKey, this.pages.length)
    }
    // 这里计算一下 table 的空行
  }

  @action
  computedRowTablePages() {
    // 每页必有 页眉header, 页脚footer
    const allPagesHaveThisHeight = this.height.header + this.height.footer
    // 退出计算! 因为页眉 + 页脚 > currentPageHeight,页面装不下其他东西
    if (allPagesHaveThisHeight > this.pageHeight) {
      return
    }
    // 某一page的累计高度
    let currentPageHeight = allPagesHaveThisHeight
    /** 区域1的高度 */
    const firstPagePanel0Height = 0
    // 当前在处理 contents 的索引
    let index = 0
    // 一页承载的内容. [object, object, ...]
    let page = []

    /* --- 遍历 contents,将内容动态分配到page --- */
    while (index < this.config.contents.length) {
      const content = this.config.contents[index]

      /* 表格内容处理 */
      if (content.type === 'table') {
        // 表格原始的高度和宽度信息
        const table = this.tablesInfo[`contents.table.${index}`]

        const {
          subtotal,
          dataKey,
          /** 本页小计 or 每页合计 */
          summaryConfig
        } = content
        // 如果显示每页合计,那么table高度多预留一行高度
        const subtotalTrHeight = subtotal.show ? getSumTrHeight(subtotal) : 0
        // 如果每页合计(新的),那么table高度多预留一行高度
        const pageSummaryTrHeight =
          summaryConfig?.pageSummaryShow && !isMultiTable(dataKey) // 双栏table没有每页合计
            ? getSumTrHeight(summaryConfig)
            : 0
        // 每个表格都具有的高度
        const allTableHaveThisHeight =
          table.head.height + subtotalTrHeight + pageSummaryTrHeight
        // 当前表格页面的最少高度
        const currentPageMinimumHeight =
          allPagesHaveThisHeight + allTableHaveThisHeight

        // 当前表格的数据
        const tableData = this.data._table[dataKey] || []
        // 表格行的索引,用于table.slice(begin, end), 分割到不同页面中
        let begin = 0
        let end = 0

        // 如果表格没有数据,那么轮一下个content
        if (
          table.body.heights.length === 0 // 没有数据,不渲染此table
        ) {
          index++
        } else {
          // 表格有数据,添加[每个表格都具有的高度]
          currentPageHeight += allTableHaveThisHeight
          // 合并单元格 开始的tr，计算合并单元格的起始值
          let start = 0
          // 防止高度过小导致死循环的保护
          let rowTableIteration = 0
          const MAX_ROW_TABLE_ITERATIONS = table.body.heights.length * 10 + 1000
          /* 遍历表格每一行 */
          while (end < table.body.heights.length) {
            rowTableIteration++
            if (rowTableIteration > MAX_ROW_TABLE_ITERATIONS) {
              console.warn('分页计算超过最大迭代次数，可能纸张高度过小')
              break
            }
            // 加上每一行的高度
            currentPageHeight += table.body.heights[end]

            // 当前页没有对于空间
            if (currentPageHeight > this.pageHeight) {
              // 第一条数据计算时，不能加上header的高度
              const calcHeight = this.pageHeight - firstPagePanel0Height
              // 当这条数据是数组（需要合并单元格），数据需要拆分
              if (_.isArray(tableData[end])) {
                // 第一次使用end值
                start = start === 0 ? end : start
                // 获取合并单元格中所有的tr
                const trs = table.bodyTr.heights.slice(
                  start,
                  start + tableData[end].length
                )
                const heightParams = {
                  currentPageHeight:
                    currentPageHeight - table.body.heights[end], // 当前计算的高度
                  calcHeight: calcHeight,
                  pageHeight: this.pageHeight, // 当前页面的最大高度
                  currentPageMinimumHeight: currentPageMinimumHeight // 当前页面的最小高度
                }
                // 计算当前页面还能放下的数据个数和高度
                const {
                  splicePoint, // 能放下的个数，拆分数组的点
                  detailsPageHeight // 能放下的高度
                } = caclRowSpanTdPageHeight(end, trs, heightParams)
                // 保证start是正确的
                start += splicePoint
                // splicePoint=0说明加上数组的第一项就超出当前页面了
                if (splicePoint !== 0) {
                  // 拆分数据
                  const splitTableData = [
                    tableData[end]?.slice(0, splicePoint),
                    tableData[end]?.slice(splicePoint)
                  ]

                  tableData.splice(end, 1, ...splitTableData)
                  // 更新数据
                  this.data._table[dataKey] = tableData
                  // 同时也要更新body.heights 不能影响后续计算
                  const splitTableBodyHeight = [
                    detailsPageHeight,
                    table.body.heights[end] - detailsPageHeight
                  ]
                  // 更新高度
                  table.body.heights.splice(end, 1, ...splitTableBodyHeight)
                  page.push({
                    type: 'table',
                    index,
                    begin,
                    end: ++end
                  })
                  begin = end
                } else {
                  // splicePoint=0 直接将数据添加进去
                  page.push({
                    type: 'table',
                    index,
                    begin,
                    end
                  })
                  begin = end
                }

                // 此页完成任务
                this.pages.push(page)
                page = []

                if (end === table.body.heights.length) {
                  page.push({
                    type: 'table',
                    index,
                    begin,
                    end
                  })
                  index++
                }
                // 开启新一页,重置页面高度
                currentPageHeight = currentPageMinimumHeight
              } else {
                // 当这条数据是对象（不需要合并单元格的时候）
                // 超出区域了直接添加
                page.push({
                  type: 'table',
                  index,
                  begin,
                  end: end
                })
                start++
                // 此页完成任务
                this.pages.push(page)
                page = []
                begin = end
                end++
                // 是最后一条数据，将数据添加到page，并进入到下一个contents
                if (end === table.body.heights.length) {
                  page.push({
                    type: 'table',
                    index,
                    begin,
                    end
                  })
                  index++
                }
                // 开启新一页,重置页面高度
                currentPageHeight = currentPageMinimumHeight
              }
            } else {
              // 有空间，继续做下行
              start = tableData[end]?.length
                ? start + tableData[end].length
                : start + 1

              end++

              // 最后一行，把信息加入 page，并轮下一个contents
              if (end === table.body.heights.length) {
                page.push({
                  type: 'table',
                  index,
                  begin,
                  end
                })
                index++
              }
            }
          }
        }
        /* 非表格内容处理 */
      } else {
        const panelHeight = this.height[`contents.panel.${index}`]
        currentPageHeight += panelHeight

        // 当 panel + allPagesHaveThisHeight > 页高度, 停止. 避免死循环
        if (panelHeight + allPagesHaveThisHeight > this.pageHeight) {
          break
        }

        if (currentPageHeight <= this.pageHeight) {
          // 空间充足，把信息加入 page，并轮下一个contents
          page.push({
            type: 'panel',
            index
          })

          index++
        } else {
          // 此页空间不足，此页完成任务
          this.pages.push(page)

          // 为下一页做准备
          page = []
          currentPageHeight = allPagesHaveThisHeight
        }
      }
    }

    this.pages.push(page)
  }

  template(text, pageIndex, totalMap) {
    // 做好保护，出错就返回 text
    let currentPage = pageIndex + 1
    let totalPage = this.pages.length
    if (this.batchKey !== undefined && this.config.printedPageOrderAndTotal) {
      const [id] = this.batchKey.split('-')
      currentPage =
        batchPrinterStore.getPrePageSize(this.batchKey) + currentPage
      totalPage = totalMap?.[id]
    }
    try {
      return _.template(text, {
        interpolate: /{{([\s\S]+?)}}/g
      })({
        ...this.data.common,
        [i18next.t('当前页码')]: currentPage,
        [i18next.t('页码总数')]: totalPage,
        price: price,
        diyRandom: diyRandom, // 提供一个计算随机数的函数
        parseFloatFun: parseFloatFun,
        removeTrailingZeros: removeTrailingZeros,
        /** 直接覆盖他，parseFloat("") => 出现NAN  */
        parseFloat: coverParseFloat,
        coverDigit2Uppercase: coverDigit2Uppercase,
        addDay: addMomentDay,
        formatDate: (date, format) => moment(date).format(format)
      })
    } catch (err) {
      return text
    }
  }

  templateTableByDelivery(text, data, index, pageIndex) {
    // 做好保护，出错就返回 text
    const currentPage = pageIndex + 1
    const totalPage = this.pages.length
    try {
      const result = _.template(text, {
        interpolate: /{{([\s\S]+?)}}/g
      })({
        ...this.data.common,
        [i18next.t('列')]: data || this.data._table.orders[index],
        [i18next.t('当前页码')]: currentPage,
        [i18next.t('页码总数')]: totalPage,
        price: price, // 提供一个价格处理函数
        diyRandom: diyRandom, // 提供一个计算随机数的函数
        parseFloatFun: parseFloatFun,
        removeTrailingZeros: removeTrailingZeros,
        /** 直接覆盖他，parseFloat("") => 出现NAN  */
        parseFloat: coverParseFloat,
        coverDigit2Uppercase: coverDigit2Uppercase,
        addDay: addMomentDay,
        formatDate: (date, format) => moment(date).format(format)
      })
      // 特殊处理配送单双栏打印出现  '元/'
      if (result === '元/') {
        return ''
      }
      return result
    } catch (err) {
      return text
    }
  }

  templateTable(text, dataKey, index, pageIndex) {
    // 做好保护，出错就返回 text
    try {
      const list = this.data._table[dataKey] || this.data._table.orders
      const result = _.template(text, {
        interpolate: /{{([\s\S]+?)}}/g
      })({
        ...this.data.common,
        [i18next.t('列')]: list[index],
        [i18next.t('当前页码')]: pageIndex + 1,
        [i18next.t('页码总数')]: this.pages.length,
        price: price, // 提供一个价格处理函数
        diyRandom: diyRandom, // 提供一个计算随机数的函数
        parseFloatFun: parseFloatFun,
        removeTrailingZeros: removeTrailingZeros,
        /** 直接覆盖他，parseFloat("") => 出现NAN  */
        parseFloat: coverParseFloat,
        coverDigit2Uppercase: coverDigit2Uppercase,
        addDay: addMomentDay,
        formatDate: (date, format) => moment(date).format(format)
      })
      // 特殊处理配送单双栏打印出现  '元/'
      if (result === '元/') {
        return ''
      }
      return result
    } catch (err) {
      return text
    }
  }

  /**
   * 计算合并单元格的数据
   * @param {string} text thead的名称
   * @param {object} item 每一行的数据
   * @returns {string} 要显示的值
   */
  templateRowSpanTable(text, item) {
    // 做好保护，出错就返回 text
    try {
      return _.template(text, {
        interpolate: /{{([\s\S]+?)}}/g
      })({
        [i18next.t('列')]: item,
        price: price, // 提供一个价格处理函数
        diyRandom: diyRandom, // 提供一个计算随机数的函数
        parseFloatFun: parseFloatFun,
        removeTrailingZeros: removeTrailingZeros,
        /** 直接覆盖他，parseFloat("") => 出现NAN  */
        parseFloat: coverParseFloat,
        coverDigit2Uppercase: coverDigit2Uppercase,
        addDay: addMomentDay,
        formatDate: (date, format) => moment(date).format(format)
      })
    } catch (err) {
      return text
    }
  }

  templateSpecialDetails(col, dataKey, index) {
    // 做好保护，出错就返回 text
    const {
      specialDetailsKey,
      text,
      detailLastColType,
      separator,
      _columnKey,
      specialDetailsColumnKey
    } = col
    try {
      const row = this.data._table[dataKey][index]
      const compiled = _.template(text, { interpolate: /{{([\s\S]+?)}}/g })
      let detailsList = row[specialDetailsKey] || []

      /** 简单处理下数据 */
      const filterList = (list, type = '') => {
        const currentList =
          _columnKey && specialDetailsColumnKey
            ? list.filter(
                _item => _item[specialDetailsColumnKey] === _columnKey
              )
            : list

        if (currentList.length === 0) {
          return '-'
        }

        if (type === 'noLineBreak') {
          const details = currentList.map(d => `${compiled(d)}`).join(separator)

          return `<div class='b-table-details'>${details}</div>`
        }
        return currentList
          .map(d => `<div class='b-table-details'> ${compiled(d)} </div>`)
          .join('')
      }
      /** 明细换行和不换行处理 */
      detailsList =
        !detailLastColType || detailLastColType === 'purchase_last_col'
          ? filterList(detailsList)
          : filterList(detailsList, 'noLineBreak')

      return detailsList
    } catch (err) {
      return text
    }
  }

  // 用于初始化的计算
  getFilledTableData(tableData) {
    const { autoFillConfig } = this.config
    if (!this.selectedRegion && !autoFillConfig?.checked) return []
    const tr_count = Math.floor(
      this.remainPageHeight / this.computedTableCustomerRowHeight
    )

    const filledData = {
      _isEmptyData: true // 表示是填充的空白数据
    }
    _.map(tableData[0], (val, key) => {
      filledData[key] = ''
    })
    return Array(tr_count).fill(filledData)
  }

  @action.bound
  changeTableData() {
    const { autoFillConfig } = this.config
    const isAutoFilling = getAutoFillingConfig(this.isAutoFilling) !== 'manual'
    if (!isAutoFilling) return
    const dataKey = autoFillConfig?.dataKey
    const table = this.data._table[dataKey]

    if (!this.isDeliverType) {
      table.push(...this.getFilledTableData(table))
    }
    this.data._table[dataKey] = table
  }
}

export default PrinterStore
