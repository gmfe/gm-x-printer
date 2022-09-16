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
const sumCol = (key, dataList) => {
  let result
  const arr = []
  try {
    result = dataList.reduce((acc, item) => {
      arr.push(item[key])
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
    range,
    printerStore
  } = props
  const _dataKey = getDataKey(dataKey, arrange)
  const summaryConfig = get(config, 'summaryConfig')

  const {
    pageSummaryShow,
    showPageType,
    pageSummaryText,
    summaryColumns
  } = summaryConfig
  const tableData = printerStore.data._table[_dataKey] || []

  const currentPageTableData = tableData.slice(range.begin, range.end)

  if (
    pageSummaryShow &&
    showPageType === SHOW_WAY_ENUM.bottom &&
    printerStore.ready &&
    !isMultiTable(_dataKey)
  ) {
    return (
      <tr>
        {_.map(columns, (col, index) => {
          let html
          // 第一列
          if (index === 0) {
            html = pageSummaryText
          } else {
            const key = regExp(col.text)
            html =
              summaryColumns.map(text => regExp(text)).includes(key) && key
                ? sumCol(key, currentPageTableData)
                : ' '
          }
          return (
            <td
              style={{
                whiteSpace: 'nowrap',
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
      </tr>
    )
  }
}

export default observer(PageSummary)
