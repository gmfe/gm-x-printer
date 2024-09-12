/*
 * @creater: suxin suxin@guanmai.cn
 * @since: 2022-08-29 10:07:17
 * @lastTime: 2022-09-09 17:41:09
 * @LastAuthor: suxin suxin@guanmai.cn
 * @文件相对于项目的路径: /gm-x-printer/src/printer/page_summary.js
 * @message: 整单合计——底部展现
 */
import React from 'react'
import _ from 'lodash'
import { getDataKey, regExp } from '../util'
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

      // 子商品不能计算合计
      if (item['子商品'] && isAllProduct) {
        return acc
      }

      acc = acc.plus(parseFloat(item[key]) || 0)
      return acc
    }, Big(0))
  } catch (e) {
    result = ''
  }
  const isInt = !arr?.find(item => item?.includes('.'))
  // 累加各个项时，如果存在小数那么保留两位小数
  return isInt ? result : result.toFixed(2)
}

// 最新每页合计
const PageSummary = props => {
  const {
    config,
    config: { dataKey, arrange, columns },
    printerStore,
    isLastPage,
    range
  } = props
  const _dataKey = getDataKey(dataKey, arrange)
  const allOrderSummaryConfig = get(config, 'allOrderSummaryConfig')

  const {
    orderSummaryShow,
    showOrderType,
    style,
    orderSummaryText,
    summaryOrderColumns
  } = allOrderSummaryConfig
  const tableData = printerStore.data._table[_dataKey] || []

  const currentOrderTableData = tableData

  // 是否是打印全部商品
  // 打印全部商品不需要计算子商品
  const isAllProduct = get(config, 'dataKey') === 'allprod'
  if (
    orderSummaryShow &&
    (config?.allOrderSummaryConfig?.isShowOrderSummaryPer || isLastPage) &&
    showOrderType === SHOW_WAY_ENUM.bottom &&
    printerStore.ready
  ) {
    return (
      <tr>
        {_.map(columns, (col, index) => {
          let html
          // 第一列
          if (index === 0) {
            html = orderSummaryText
          } else {
            const key = regExp(col.text)

            html =
              summaryOrderColumns.map(text => regExp(text)).includes(key) && key
                ? sumCol(key, currentOrderTableData, isAllProduct)
                : ' '
          }
          return (
            <td
              style={{
                whiteSpace: 'nowrap',
                fontWeight: 'bold',
                textAlign: 'center',
                ...style
              }}
              colSpan={1}
              key={index}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )
        })}
      </tr>
    )
  }
}

export default observer(PageSummary)
