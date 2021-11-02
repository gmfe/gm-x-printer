import i18next from '../../locales'
import { action, observable } from 'mobx'
import { getSumTrHeight, isMultiTable, caclRowSpanTdPageHeight } from '../util'
import _ from 'lodash'
import Big from 'big.js'

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

  data = {}

  // 选中某个东西，具体见 edit/store.js 定义
  @observable
  selected = null

  // 选择中区域
  @observable
  selectedRegion = null

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

  @action
  setSelected(selected) {
    this.selected = selected || null
  }

  @action
  setSelectedRegion(selected) {
    this.selectedRegion = selected || null
  }

  @action
  computedPages() {
    // 每页必有 页眉header, 页脚footer
    const allPagesHaveThisHeight = this.height.header + this.height.footer
    // 退出计算! 因为页眉 + 页脚 > currentPageHeight,页面装不下其他东西
    if (allPagesHaveThisHeight > this.pageHeight) {
      return
    }

    // 某一page的累计高度
    let currentPageHeight = allPagesHaveThisHeight
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

        // 表格行的索引,用于table.slice(begin, end), 分割到不同页面中
        let begin = 0
        let end = 0

        // 如果表格没有数据,那么轮一下个content
        if (
          table.body.heights.length === 0 || // 没有数据,不渲染此table
          table.body.heights[0] + currentPageMinimumHeight > this.pageHeight // 页面无法容纳此table,不渲染这个table了
        ) {
          if (
            table.body.heights[0] + currentPageMinimumHeight >
            this.pageHeight
          ) {
            window.alert('表格明细内容过多，无法打印，请更换其他打印模板') // 例如: 采购明细放在单列-最后一列,造成一列高度大于页面高度
          }
          index++
        } else {
          // 表格有数据,添加[每个表格都具有的高度]
          currentPageHeight += allTableHaveThisHeight

          /* 遍历表格每一行 */
          while (end < table.body.heights.length) {
            currentPageHeight += table.body.heights[end]

            // 当前页没有对于空间
            if (currentPageHeight > this.pageHeight) {
              if (end !== 0) {
                // ‼️‼️‼️ 极端情况: 如果一行的高度 大于 页面高度, 那么就做下一行
                if (
                  table.body.heights[end] + currentPageMinimumHeight >
                  this.pageHeight
                ) {
                  end++
                }
                page.push({
                  type: 'table',
                  index,
                  begin,
                  end
                })
              }

              begin = end

              // 此页完成任务
              this.pages.push(page)

              // 开启新一页,重置页面高度
              page = []
              currentPageHeight = currentPageMinimumHeight
            } else {
              // 有空间，继续做下行
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

      return _.template(text, {
        interpolate: /{{([\s\S]+?)}}/g
      })({
        ...this.data.common,
        [i18next.t('列')]: list[index],
        [i18next.t('当前页码')]: pageIndex + 1,
        [i18next.t('页码总数')]: this.pages.length,
        price: price // 提供一个价格处理函数
      })
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
}

export default PrinterStore
