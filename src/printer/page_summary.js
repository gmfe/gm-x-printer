/*
 * @creater: suxin suxin@guanmai.cn
 * @since: 2022-08-29 10:07:17
 * @lastTime: 2022-09-09 17:41:09
 * @LastAuthor: suxin suxin@guanmai.cn
 * @文件相对于项目的路径: /gm-x-printer/src/printer/page_summary.js
 * @message: 每页合计——底部展现
 */
import React from 'react'
import _ from 'lodash'
import { getDataKey, isMultiTable, regExp } from '../util'
import Big from 'big.js'
import { observer } from 'mobx-react'
import { get } from 'mobx'
import { SHOW_WAY_ENUM } from '../config'
/**
 * 每列统计
 * @param key
 * @param dataList
 * @returns {*|string}
 */
const sumCol = (key, dataList, isAllProduct) => {
  let result
  const arr = []
  try {
    result = dataList.reduce((acc, item) => {
      arr.push(item[key])
      if (isAllProduct) {
        if (item['子商品']) {
          return acc
        }
      }
      acc = acc.plus(parseFloat(item[key]) || 0)
      return acc
    }, Big(0))
  } catch (e) {
    result = ''
  }
  const isInt = !arr?.find(item => item?.includes('.'))
  // 累加各个项时，如果存在小数那么保留两位小数
  if (result) {
    return isInt ? result : result.toFixed(2)
  }
  return result
}

const sumColWithMulti = (key, dataList, isAllProduct) => {
  let result
  const arr = []
  try {
    result = dataList.reduce((acc, item) => {
      arr.push(item[key])
      arr.push(item[`${key}_MULTI_SUFFIX`])
      if (isAllProduct) {
        if (item['子商品']) {
          return acc
        }
      }
      acc = acc.plus(parseFloat(item[key]) || 0)
      acc = acc.plus(parseFloat(item[`${key}_MULTI_SUFFIX`]) || 0)
      return acc
    }, Big(0))
  } catch (e) {
    result = ''
  }
  const isInt = !arr?.find(item => item?.includes('.'))
  // 累加各个项时，如果存在小数那么保留两位小数
  if (result) {
    return isInt ? result : result.toFixed(2)
  }
  return result
}

// 最新每页合计
const PageSummary = props => {
  const {
    config,
    config: { dataKey, arrange, columns },
    range,
    printerStore
  } = props
  const _dataKey = getDataKey(dataKey, arrange, printerStore.tableVerticalStyle)
  const summaryConfig = get(config, 'summaryConfig')

  const {
    pageSummaryShow,
    showPageType,
    pageSummaryText,
    summaryColumns
  } = summaryConfig
  const tableData = printerStore.data._table[_dataKey] || []
  // console.log(props)
  const currentPageTableData = tableData.slice(range.begin, range.end)

  // 是否是打印全部商品
  // 打印全部商品不需要计算组合商品
  const isAllProduct = get(config, 'dataKey') === 'allprod'

  const isMulti = isMultiTable(_dataKey)

  const renderColumns = () => {
    console.log(12323333)
    return (
      <>
        {_.map(columns, (col, index) => {
          let html
          // 第一列
          if (index === 0) {
            html = pageSummaryText
          } else {
            const key = regExp(col.text)
            html =
              summaryColumns.map(text => regExp(text)).includes(key) && key
                ? !isMulti
                  ? sumCol(key, currentPageTableData, isAllProduct)
                  : sumColWithMulti(key, currentPageTableData, isAllProduct)
                : ' '
          }
          return (
            <td
              style={{
                fontWeight: 'bold',
                textAlign: 'center',
                ...summaryConfig.style
              }}
              colSpan={1}
              key={index}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )
        })}
      </>
    )
  }

  if (pageSummaryShow && showPageType === SHOW_WAY_ENUM.bottom) {
    return (
      <tr
        style={
          isMulti
            ? {
                borderRight: '1px solid',
                borderBottom:
                  !config?.allOrderSummaryConfig?.orderSummaryShow ||
                  !config?.allOrderSummaryConfig?.isShowOrderSummaryPer
                    ? '1px solid'
                    : 'none'
              }
            : {}
        }
      >
        {renderColumns()}
      </tr>
    )
  }
}

export default observer(PageSummary)
