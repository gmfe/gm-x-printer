import i18next from '../../locales'
import { action, observable, computed } from 'mobx'
import {
  getSumTrHeight,
  isMultiTable,
  getArrayMid,
  caclRowSpanTdPageHeight,
  caclSingleDetailsPageHeight
} from '../util'
import _ from 'lodash'
import Big from 'big.js'

export const TR_BASE_HEIGHT = 23
const price = (n, f = 2) => Big(n || 0).toFixed(f)
class PrinterStore {
  @observable ready = false

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

  // 选中某个东西，具体见 edit/store.js 定义
  @observable
  selected = null

  // 选择中区域
  @observable
  selectedRegion = null

  // 是否自动行数填充
  @observable
  isAutoFilling = false

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
  }

  @action
  setAutofillConfig(bol) {
    this.isAutoFilling = bol
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
    this.tablesInfo[name] = table
  }

  @action
  setReady(ready) {
    this.ready = ready
  }

  get tableConfig() {
    const { autoFillConfig } = this.config
    if (!this.selectedRegion && !autoFillConfig?.checked) return null
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

    const len = this.tableData.length
    // 如果是已经开了填充配置，回显的heights包括了填充的表格部分，关闭配置时，这种情况就要去掉填充的
    if (_.gt(heights.length, len)) return heights.slice(0, len)

    const hasEmptyData = this.tableData.some(x => x._isEmptyData)
    const isOrderCategroy = dataKey === this.config?.autoFillConfig?.dataKey
    const { customerRowHeight = TR_BASE_HEIGHT } = this.tableConfig

    if (hasEmptyData && !this.isAutoFilling && isOrderCategroy) {
      // 如果tableData有填充的空数据， 则去掉
      return heights.slice(0, -this.filledTableLen)
    } else if (this.isAutoFilling && isOrderCategroy) {
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
    const tableData = this.data._table[dataKey] || []

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
        // 是表格就++
        tableCount++
        // 表格原始的高度和宽度信息
        const table = this.tablesInfo[`contents.table.${index}`]
        const { subtotal, dataKey, summaryConfig } = content
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
        /** 当前page页面的最小高度 */
        const currentPageMinimumHeight =
          allPagesHaveThisHeight + allTableHaveThisHeight
        /** 当前page可容纳的table高度 */
        let pageAccomodateTableHeight = +new Big(this.pageHeight)
          .minus(currentPageHeight)
          .toFixed(2)

        const heights = this.getNormalTableBodyHeights(
          table.body.heights,
          dataKey
        )
        // 表格行的索引,用于table.slice(begin, end), 分割到不同页面中
        let begin = 0
        let end = 0
        // 如果表格没有数据,那么轮一下个content
        if (heights.length === 0) {
          index++
        } else {
          /** 仅计算当前页table的累积高度 */
          let currentTableHeight = allTableHaveThisHeight
          // 表格有数据,添加[每个表格都具有的高度]
          currentPageHeight += allTableHaveThisHeight
          /** 当前table剩余的高度 */
          let currentRemainTableHeight = 0
          /** 去最小的tr高度，用于下面的计算compare,(避免特殊情况：一般来说最小tr——height = 23, 比23还小的不考虑计算) */
          const minHeight = Math.max(getArrayMid(heights), 23)

          /* 遍历表格每一行，填充表格内容 */
          while (end < heights.length) {
            currentTableHeight += heights[end]
            // 用于计算最后一页有footer情况的高度
            currentPageHeight += heights[end]
            // 当前页没有多余空间
            if (currentTableHeight > pageAccomodateTableHeight) {
              currentRemainTableHeight = +Big(pageAccomodateTableHeight)
                .minus(currentTableHeight)
                .plus(heights[end])

              /**
               * 说明： 1. currentRemainTableHeight至少要是minHeight的 2倍，不然每次到这都进入if，同时留下一点空白距离
               * 2. heights[end]至少要是currentRemainTableHeight的 1倍，怕出现打印时最后一行文字显示一半的情况
               * 3. heights[end] 高度超过了 pageAccomodateTableHeight
               */
              if (
                (currentRemainTableHeight / minHeight > 1.5 &&
                  heights[end] / currentRemainTableHeight > 1) ||
                heights[end] > pageAccomodateTableHeight
              ) {
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
                  end++
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
              if (end === heights.length) {
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

        // 如果是最后一页，必须要加上sign的高度，否则会重叠
        if (index === this.config.contents.length - 1) {
          currentPageHeight += this.height?.sign
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

    this.remainPageHeight = +Big(this.pageHeight - currentPageHeight).toFixed(0)
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

        const { subtotal, dataKey, summaryConfig } = content
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
          /* 遍历表格每一行 */
          while (end < table.body.heights.length) {
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

  template(text, pageIndex) {
    // 做好保护，出错就返回 text
    try {
      return _.template(text, {
        interpolate: /{{([\s\S]+?)}}/g
      })({
        ...this.data.common,
        [i18next.t('当前页码')]: pageIndex + 1,
        [i18next.t('页码总数')]: this.pages.length,
        price: price
      })
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
        price: price // 提供一个价格处理函数
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
        price: price // 提供一个价格处理函数
      })
    } catch (err) {
      return text
    }
  }

  templateSpecialDetails(col, dataKey, index) {
    // 做好保护，出错就返回 text
    const { specialDetailsKey, text } = col
    try {
      const row = this.data._table[dataKey][index]
      const compiled = _.template(text, { interpolate: /{{([\s\S]+?)}}/g })
      const detailsList = row[specialDetailsKey]

      return detailsList.map(d => `<div>${compiled(d)}</div>`).join('')
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
    if (!this.isAutoFilling) return
    const dataKey = autoFillConfig?.dataKey
    const table = this.data._table[dataKey]

    table.push(...this.getFilledTableData(table))
    this.data._table[dataKey] = table
  }
}

export default PrinterStore
