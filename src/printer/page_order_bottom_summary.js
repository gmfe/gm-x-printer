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
import { MULTI_SUFFIX, SHOW_WAY_ENUM } from '../config'
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
      if (item[key + MULTI_SUFFIX]) {
        acc = acc.plus(parseFloat(item[key + MULTI_SUFFIX]))
      }
      return acc
    }, Big(0))
  } catch (e) {
    result = ''
  }
  // 单元格可能是数字（如学生餐横向表），String 化后判定小数位，避免 number.includes 崩溃
  const isInt = !arr?.find(item => String(item ?? '').includes('.'))
  if (result) {
    return isInt ? result : result.toFixed(2)
  }
  return result
  // 累加各个项时，如果存在小数那么保留两位小数
}

// 最新整单合计
const PageSummary = props => {
  const {
    config,
    config: { dataKey, arrange, columns },
    printerStore,
    isLastPage
  } = props
  const _dataKey = getDataKey(dataKey, arrange, printerStore.tableVerticalStyle)
  // 未配置整单合计的表体容错，避免裸解构崩溃
  const allOrderSummaryConfig = get(config, 'allOrderSummaryConfig') || {}

  const {
    orderSummaryShow,
    showOrderType,
    style,
    orderSummaryText,
    summaryOrderColumns,
    // 2026-10-14 口径：仅整单合计行做重量换算（单元格原值展示）。per-key 映射
    // { value, operator: 'divide'|'multiply' }：重量列配系数，配餐人数等非重量列不换算；
    // ÷0 或 ×0 结果为 0（空保存归一 0 的配套口径）
    sumConvertByField
  } = allOrderSummaryConfig
  const tableData = printerStore.data._table[_dataKey] || []

  const currentOrderTableData = tableData

  // 是否是打印全部商品
  // 打印全部商品不需要计算子商品
  const isAllProduct = get(config, 'dataKey') === 'allprod'
  const isMultiPage = _dataKey?.includes('multi')
  if (
    orderSummaryShow &&
    (config?.allOrderSummaryConfig?.isShowOrderSummaryPer || isLastPage) &&
    showOrderType === SHOW_WAY_ENUM.bottom
  ) {
    // 可汇总列集合（模板串提取 key）；文案列自适应：汇总列显示合计值，
    // 「整单合计」文案落在第一个非汇总列（如横向表的班级列）；
    // 无任何非汇总列时退回首列文案（兼容纯菜品列表体）
    const summableKeys = summaryOrderColumns.map(text => regExp(text))
    const firstNonSummableIndex = columns.findIndex(col => {
      const key = regExp(col.text)
      return !key || !summableKeys.includes(key)
    })
    const labelIndex = firstNonSummableIndex >= 0 ? firstNonSummableIndex : 0
    return (
      <tr>
        {_.map(columns, (col, index) => {
          let html
          const key = regExp(col.text)
          const isSummable = key && summableKeys.includes(key)
          if (
            index === labelIndex &&
            (!isSummable || firstNonSummableIndex < 0)
          ) {
            html = orderSummaryText
          } else if (isSummable) {
            if (!printerStore.ready) {
              html = ' '
            } else {
              // 仅合计行换算（sumConvertByField[key]，未配置则原样）
              const summed = sumCol(key, currentOrderTableData, isAllProduct)
              const convert = sumConvertByField?.[key]
              if (summed !== '' && convert && Number.isFinite(convert.value)) {
                const bigSum = new Big(summed)
                html =
                  convert.operator === 'multiply'
                    ? bigSum
                        .times(convert.value)
                        .round(2)
                        .toString()
                    : convert.value > 0
                    ? bigSum
                        .div(convert.value)
                        .round(2)
                        .toString()
                    : new Big(0).toString()
              } else {
                html = summed
              }
            }
          } else {
            html = ' '
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
        {isMultiPage && (
          <td
            colSpan={99}
            style={{
              ...style
            }}
          />
        )}
      </tr>
    )
  }
}

export default observer(PageSummary)
