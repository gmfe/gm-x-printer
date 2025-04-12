import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import {
  dispatchMsg,
  getDataKey,
  getHeight,
  getMultiNumber,
  getTableColumnName,
  getHeadThWidth,
  isMultiTable,
  isRowSpanTable,
  getTableRowColumnName,
  getAutoFillingConfig
} from '../util'
import { inject, observer } from 'mobx-react'
import classNames from 'classnames'
import { MULTI_SUFFIX } from '../config'
import SpecialTr from './table_special_tr'
import SubtotalTrShowRow from './table_subtoal_tr_showRow'
import AllOrderSummaryRow from './table_all_order_summary'
import PageSummary from './page_summary'
import PageOrderSummary from './page_order_bottom_summary'

@inject('printerStore')
@observer
class Table extends React.Component {
  constructor(props) {
    super(props)
    this.ref = React.createRef()
    this.state = {
      index: null
    }
  }

  componentDidMount() {
    if (!this.props.printerStore.ready) {
      this.getTableHeight()
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.props.printerStore.tableReady[this.props.name]) {
      // TODO 增加定时器，页面渲染完成后再获取高度 因为如果不设置定时器，页面渲染完成后，table的高度还没有计算出来
      setTimeout(async () => {
        await this.getTableHeight()
      }, 3000)
    }
  }

  getTableHeight = async (isInit = true) => {
    let {
      name,
      printerStore,
      config: { dataKey, arrange }
    } = this.props
    // 整单合计，如果设置了整单合计，那么需要给第一个单元格增加宽度
    const isShowOrderSummaryPer = !!this.props.config?.allOrderSummaryConfig
      ?.isShowOrderSummaryPer
    // 数据
    dataKey = getDataKey(dataKey, arrange, printerStore.tableVerticalStyle)
    const tableData = printerStore.data._table[dataKey] || []
    const $table = this.ref.current.querySelector('table')
    const tHead = $table.querySelector('thead')
    const ths = tHead.querySelectorAll('th') || []
    const trs =
      $table.querySelectorAll(
        `${
          isRowSpanTable(tableData)
            ? 'tbody .rowSpan-column-rowSpan' // 序号的那一列有这个类名
            : 'tbody tr'
        }`
      ) || []
    const trRowSpan = $table.querySelectorAll('tbody tr') || []
    const detailsDiv = $table.querySelectorAll('tr td .b-table-details')
    printerStore.setHeight(name, getHeight($table))

    // 多列表格的宽度一定要一样，所以这里用 map 存储 dataname 的 width
    const headThWidthMap = {}

    printerStore.setTable(name, {
      head: {
        height: getHeight(tHead),
        widths: _.map(ths, (th, index) => {
          let width = getHeadThWidth(th)
          if (isShowOrderSummaryPer) {
            if (index === 0) {
              width = 50
            }
          }
          if (!headThWidthMap[th.dataset.name]) {
            headThWidthMap[th.dataset.name] = width
          } else {
            headThWidthMap[th.dataset.name] = Math.max(
              headThWidthMap[th.dataset.name],
              width
            )
          }
          return headThWidthMap[th.dataset.name]
        })
      },
      body: {
        heights: _.map(trs, tr => getHeight(tr)),
        children: _.map(detailsDiv, div => getHeight(div))
      },
      bodyTr: {
        heights: _.map(trRowSpan, tr => getHeight(tr))
      }
    })

    if (isInit) {
      // 重新计算一下tableHeight
      await new Promise(resolve => setTimeout(resolve, 0))
      await this.getTableHeight(false)
    } else {
      // 需要判断一下tableData是否为空
      // if (!tableData.length) {
      /** table数据允许为空，如果遇到空的table 数据，导致printer 没有setReady  */
      setTimeout(() => {
        this.props.printerStore.setTableReady(this.props.name, true)
      }, 300)
      // }
    }
  }

  handleClick = e => {
    const { name } = this.props
    const { index } = e.target.dataset

    dispatchMsg('gm-printer-select', {
      selected: getTableColumnName(name, index)
    })
  }

  handleDragStart = e => {
    const { name } = this.props
    const { index } = e.target.dataset

    this.setState({
      index
    })

    dispatchMsg('gm-printer-select', {
      selected: getTableColumnName(name, index)
    })
  }

  handleSelectedRegion = () => {
    const { name } = this.props

    dispatchMsg('gm-printer-select-region', { selected: name })
  }

  handleDrop = e => {
    const { index } = e.target.dataset

    if (this.state.index !== index) {
      dispatchMsg('gm-printer-table-drag', {
        source: this.state.index,
        target: index
      })
    }
  }

  handleDragOver = e => {
    e.preventDefault()
  }

  getColumns = () => {
    const {
      config: { columns, dataKey }
    } = this.props
    const newColumns = columns.map((val, index) => ({ ...val, index }))
    // 如果是多列表格
    if (isMultiTable(dataKey)) {
      // 多栏商品的第二列有点特殊,都带 _MULTI_SUFFIX 后缀
      let res = _.slice(newColumns)
      const colNumber = getMultiNumber(dataKey)
      for (let i = 2; i <= colNumber; i++) {
        const colNum = i > 2 ? i : '' // 栏数
        const columnsI = newColumns.map((val, index) => {
          const data = {
            ...val,
            index,
            text: val.text.replace(
              // 解释下正则
              // < (price\()? > ----  匹配< price( >函数  < ？>代表0-1个
              // < [^{{]+ >     ----  除了{{ 的其他值      < + >代表 至少一个
              /{{(price\(|parseFloatFun\()?列\.([^{{]+)}}/g,
              // s {{列.序号}} s1 undefined s2 序号
              // s--{{price(列.套账下单金额)}} s1--price(   s2---套账下单金额)
              (s, s1, s2) => {
                if (s1) {
                  // 有price或者parseFloatFun函数插进来， 匹配字符串并添加后缀，生成三栏或者双栏数据
                  // {{price(列.出库金额,1)}} ---》{{price(列.出库金额_MULTI_SUFFIX,1)}}
                  const _s = s.replace(
                    /[\u4e00-\u9fa5]+\.[\u4e00-\u9fa5]*[_]?[\u4e00-\u9fa5]*/g,
                    match => `${match}${MULTI_SUFFIX}${colNum}`
                  )
                  return _s
                } else {
                  return `{{列.${s2}${MULTI_SUFFIX}${colNum}}}`
                }
              }
            )
          }
          // 多栏商品的明细取 __details_MULTI_SUFFIX
          if (val.specialDetailsKey)
            data.specialDetailsKey =
              val.specialDetailsKey + `${MULTI_SUFFIX}${colNum}`
          return data
        })
        res = res.concat(columnsI)
      }
      return res
    } else {
      return newColumns
    }
  }

  getTableData = i => {
    const {
      printerStore,
      name,
      config: { dataKey, arrange },
      range
    } = this.props
    if (!printerStore.isDeliverType) {
      const tableData = printerStore.data._table[dataKey] || []
      return tableData[i]
    }
    const isAutoFillingText = getAutoFillingConfig(printerStore.isAutoFilling)
    const tableData =
      printerStore.data._table[
        getDataKey(dataKey, arrange, printerStore.tableVerticalStyle)
      ] || []
    const isMultiPage = dataKey?.includes('multi')
    let data = {}
    if (tableData.length > i) {
      data = tableData[i]
    }
    if (isAutoFillingText === 'number') {
      if (_.isArray(data)) {
        if (_.flatten(data).length > 0) {
          data.forEach((item, index) => {
            item['序号'] = i + index + 1
          })
        }
      } else {
        let num = i + 1
        // 只有双栏才会用到
        if (isMultiPage && arrange !== 'vertical') {
          num = i + 1 + i
        }
        if (!data || !data['序号']) {
          data = {
            ...data,
            序号: num
          }
        }
      }
    }
    // 双栏数据比较特殊，需要特殊处理
    if (isMultiPage) {
      const sku2 = {}
      let data2 = {}
      if (
        arrange === 'vertical' &&
        printerStore.isDeliverType &&
        printerStore.isFirstLeftThenRight
      ) {
        // 当前页数 * 当前行数
        const index = printerStore.lastTableCellCount[name] + i
        if (tableData.length > index) {
          data2 = tableData[index]
        }
        _.each(data2, (val, key) => {
          sku2[key + MULTI_SUFFIX] = val
        })
      }
      if (isAutoFillingText === 'number') {
        // 只有编辑的时候才会用到
        if (arrange === 'vertical' && printerStore.isDeliverType) {
          const index = printerStore.lastTableCellCount[name] + i + 1
          sku2['序号' + MULTI_SUFFIX] = index
        } else {
          sku2['序号' + MULTI_SUFFIX] = i + i + 2
        }
      }
      return { ...data, ...sku2 }
    } else {
      return data
    }
  }

  renderDefault() {
    let {
      config,
      config: { dataKey, arrange, customerRowHeight = 23 },
      name,
      range,
      pageIndex,
      printerStore,
      isLastPage
    } = this.props
    // 数据
    dataKey = getDataKey(dataKey, arrange, printerStore.tableVerticalStyle)
    const tableData = printerStore.data._table[dataKey] || []
    // 列
    const columns = this.getColumns()

    // 列宽固定(避免跳页bug)
    const thWidths = printerStore.tablesInfo[name]?.head.widths || []
    // 判断是那个生产单据，需要合并哪些单元格
    // includesColText 优先取tableRowSpanIncludes，tableRowSpanTdArr为生产专用
    const includesColText =
      printerStore.config.tableRowSpanIncludes ||
      printerStore.config?.tableRowSpanTdArr?.[
        printerStore?.config?.productionMergeType
      ] ||
      []

    const getTdStyle = (index, style = {}, headerStyle = {}) => {
      const width = thWidths[index]
      const { fontSize } = style
      let tdStyle = {}
      let minWidth = 24

      if (!width) return tdStyle
      if (fontSize) minWidth = _.parseInt(fontSize) * 2

      // 如果设置了宽度，则不要再去计算
      if (headerStyle.width && headerStyle.width !== 'auto') {
        const styleWidth = _.parseInt(headerStyle.width)
        minWidth = Math.max(minWidth, styleWidth)
        tdStyle = {
          minWidth: minWidth
        }
        return tdStyle
      }

      if (width >= 150) {
        tdStyle = {
          minWidth: width
        }
      } else {
        tdStyle = {
          minWidth,
          width
        }
      }
      return tdStyle
    }

    let begin = range.begin
    let end = range.end
    // 设置的时候显示
    // if (isSetting === true) {
    //   console.log('isSetting', isSetting)
    //   if (printerStore.linesPerPage) {
    //     end = printerStore.linesPerPage
    //   }
    // }
    if (printerStore.isDeliverType) {
      if (arrange === 'vertical' && printerStore.isFirstLeftThenRight) {
        begin = range.trueBegin
        end = Number(begin) + Number(range.size)
      }
    }
    return (
      <table>
        <thead>
          <tr style={{ height: `${customerRowHeight}px` }}>
            {_.map(columns, (col, i) => (
              <th
                key={i}
                data-index={col.index}
                data-name={getTableColumnName(name, col.index)}
                draggable
                style={{
                  ...getTdStyle(i, col.style, col.headStyle),
                  ...col.headStyle
                }}
                className={classNames({
                  active:
                    getTableColumnName(name, col.index) ===
                    printerStore.selected
                })}
                onClick={this.handleClick}
                onDragStart={this.handleDragStart}
                onDrop={this.handleDrop}
                onDragOver={this.handleDragOver}
              >
                {col.head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {_.map(_.range(begin, end), i => {
            let data = this.getTableData(i)
            const _special = data && data._special
            if (_special)
              return <SpecialTr key={i} config={config} data={_special} />
            // 如果项为空对象展现一个占满一行的td
            let isItemNone = !_.keys(data).length
            if (printerStore.isDeliverType) {
              isItemNone = false
            }
            if (
              printerStore.isDeliverType &&
              i >= printerStore.lastTableCellCount[name] &&
              printerStore.isDeliverType
            ) {
              data = {}
            }
            // 将数据根据process_task_command_id进行分组
            const tableDataGroupBy = _.groupBy(data, 'process_task_command_id')
            // 处理数据是数组的情况(生产单据)
            if (_.isArray(data)) {
              // 合并的坐标
              let rowSpanKey = 0
              return _.map(data, (item, j) => {
                // 获取process_task_command_id对应的数组
                const processTaskCommandIdArr =
                  tableDataGroupBy[data[j]?.process_task_command_id]
                // 处理特殊情况：计算分页时，一个数组中rowSpan的true和false分成了两个数组的情况
                if (
                  _.every(
                    processTaskCommandIdArr,
                    item => item.rowSpan === false
                  )
                ) {
                  _.isArray(data[j])
                    ? (data[j][0].rowSpan = true)
                    : (data[j].rowSpan = true)
                }
                return (
                  <tr style={{ height: `${customerRowHeight}px` }} key={j}>
                    {isItemNone ? (
                      <td colSpan='99' />
                    ) : (
                      _.map(columns, (col, index) => {
                        // 跨行
                        const span = processTaskCommandIdArr.length
                        let isRowSpan =
                          includesColText.includes(col.text) && j === 0
                        // 去除单元格
                        let rowTdRender =
                          includesColText.includes(col.text) && j !== 0
                        // 合并单元格的个数
                        let rowSpanLength = data.length

                        // 是熟食的组合工序聚合
                        if (
                          printerStore.config?.productionMergeType === '3' &&
                          !['{{列.序号}}', '{{列.组合工序}}'].includes(
                            col.text
                          ) &&
                          printerStore.config?.tableRowSpanTdArr[2].includes(
                            col.text
                          ) &&
                          data[j]?.process_task_command_id
                        ) {
                          // 是熟食的组合工序聚合,合并单元格要发生变化
                          // 是否跨行
                          isRowSpan =
                            printerStore.config.tableRowSpanTdArr[2].includes(
                              col.text
                            ) && data[j].rowSpan
                          // 去除对于的单元格
                          rowTdRender =
                            printerStore.config.tableRowSpanTdArr[2].includes(
                              col.text
                            ) && !data[j].rowSpan
                          // 合并单元格的个数
                          rowSpanLength = processTaskCommandIdArr.length
                        }
                        // 学生餐配送单：
                        // 如果是餐次餐标，需要判断processTaskCommandIdArr
                        if (
                          printerStore.config &&
                          printerStore.config.tableRowSpanIncludes &&
                          printerStore.config.tableRowSpanIncludes.includes(
                            '{{列.配送内容}}'
                          ) &&
                          printerStore.config.type === 'eshop_delivery' &&
                          col.text.includes('{{列.配送内容}}')
                        ) {
                          if (j === span + rowSpanKey) {
                            rowTdRender = false
                            isRowSpan = true
                            rowSpanKey = j
                          }
                          rowSpanLength = processTaskCommandIdArr.length
                        }
                        return (
                          !rowTdRender && (
                            <td
                              key={index}
                              rowSpan={
                                isRowSpan ? `${rowSpanLength}` : undefined
                              }
                              data-name={getTableColumnName(name, col.index)}
                              style={{
                                maxWidth: thWidths[index],
                                minWidth: '24px', // 最小两个字24px
                                wordBreak: 'break-all',
                                ...col.style
                              }}
                              className={classNames({
                                active:
                                  getTableColumnName(name, col.index) ===
                                  printerStore.selected,
                                [getTableRowColumnName(
                                  col.rowSpan
                                )]: col.rowSpan
                              })}
                              dangerouslySetInnerHTML={{
                                __html: printerStore.templateRowSpanTable(
                                  col.text,
                                  item
                                )
                              }}
                            />
                          )
                        )
                      })
                    )}
                  </tr>
                )
              })
            } else {
              return (
                <tr style={{ height: `${customerRowHeight}px` }} key={i}>
                  {isItemNone ? (
                    <td colSpan='99' />
                  ) : (
                    _.map(columns, (col, j) => {
                      return (
                        <td
                          key={j}
                          data-name={getTableColumnName(name, col.index)}
                          style={{
                            wordBreak: 'break-all',
                            ...getTdStyle(j, col.style, col.headStyle),
                            ...col.style
                          }}
                          className={classNames({
                            active:
                              getTableColumnName(name, col.index) ===
                              printerStore.selected,
                            [getTableRowColumnName(col.rowSpan)]: col.rowSpan
                          })}
                          dangerouslySetInnerHTML={{
                            __html: col.isSpecialColumn
                              ? printerStore.templateSpecialDetails(
                                  col,
                                  dataKey,
                                  i
                                )
                              : printerStore.isDeliverType
                              ? printerStore.templateTableByDelivery(
                                  col.text,
                                  data,
                                  i,
                                  pageIndex
                                )
                              : printerStore.templateTable(
                                  col.text,
                                  dataKey,
                                  i,
                                  pageIndex
                                )
                          }}
                        />
                      )
                    })
                  )}
                </tr>
              )
            }
          })}
          {/* 区域2 */}
          {(this.props?.isDeliverType ||
            config?.allOrderSummaryConfig ||
            config.summaryConfig) && (
            <>
              <SubtotalTrShowRow {...this.props} begin={begin} end={end} />
              {/* /** 每页合计 */}
              <PageSummary {...this.props} />
              {/* 整单合计 */}
              <PageOrderSummary {...this.props} />
              {config?.allOrderSummaryConfig?.orderSummaryShow &&
                (config?.allOrderSummaryConfig?.isShowOrderSummaryPer ||
                  isLastPage) && (
                  <AllOrderSummaryRow
                    range={range}
                    config={config}
                    printerStore={printerStore}
                  />
                )}
            </>
          )}
        </tbody>
      </table>
    )
  }

  renderEmptyTable() {
    return (
      <table>
        <thead />
        <tbody>
          <tr />
        </tbody>
      </table>
    )
  }

  render() {
    let {
      config: { className, dataKey, arrange },
      name,
      placeholder,
      printerStore
    } = this.props
    dataKey = getDataKey(dataKey, arrange, printerStore.tableVerticalStyle)
    const tableData = printerStore.data._table[dataKey] || []
    const active = printerStore.selectedRegion === name
    return (
      <div
        ref={this.ref}
        className={classNames(
          'gm-printer-table',
          'gm-printer-table-classname-' + (className || 'default'),
          { active }
        )}
        data-name={name}
        data-placeholder={placeholder}
        onClick={this.handleSelectedRegion}
      >
        {tableData.length ? this.renderDefault() : this.renderEmptyTable()}
      </div>
    )
  }
}

Table.propTypes = {
  config: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  range: PropTypes.object.isRequired,
  pageIndex: PropTypes.number.isRequired,
  placeholder: PropTypes.string,
  printerStore: PropTypes.object,
  isLastPage: PropTypes.bool,
  isDeliverType: PropTypes.bool,
  isRenderBefore: PropTypes.bool,
  isSetting: PropTypes.bool
}

export default Table
