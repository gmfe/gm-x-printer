/*
 * @creater: suxin suxin@guanmai.cn
 * @since: 2022-09-02 15:14:19
 * @lastTime: 2022-09-09 16:18:15
 * @LastAuthor: suxin suxin@guanmai.cn
 * @文件相对于项目的路径: /gm-x-printer/src/printer/table_all_order_summary.js
 * @message: 整单合计_整行展现
 */
import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { observer } from 'mobx-react'
// eslint-disable-next-line no-unused-vars
import {
  MULTI_SUFFIX,
  TEXT_SPACE,
  TWO_TEXT_SPACE,
  SHOW_WAY_ENUM,
  SHOW_ORDER_CASE_ENUM
} from '../config'
import Big from 'big.js'
import { coverDigit2Uppercase, getDataKey } from '../util'
import { get } from 'mobx'
const AllOrderSummary = props => {
  const {
    config,
    config: { dataKey, arrange, subtotal },
    printerStore
  } = props

  const tableData = printerStore.data._table[getDataKey(dataKey, arrange)] || []
  // 计算合计
  const sumData = (list, field) => {
    return _.reduce(
      list,
      (a, b) => {
        let result = a

        result = a.plus(parseFloat(b[field]) || 0)
        if (b[field + MULTI_SUFFIX]) {
          result = result.plus(parseFloat(b[field + MULTI_SUFFIX]))
        }
        return result
      },
      Big(0)
    ).toFixed(2)
  }

  const allOrderSummaryConfig = get(config, 'allOrderSummaryConfig')

  const { order_needUpperCase, order_needLowerCase } = subtotal
  const {
    orderSummaryShow,
    showOrderType,
    fields,
    orderUpperCaseText,
    orderLowerCaseText,
    orderFontSort,
    style,
    orderSummaryText
  } = allOrderSummaryConfig
  // 每页小计
  if (
    orderSummaryShow &&
    showOrderType === SHOW_WAY_ENUM.row &&
    printerStore.ready
  ) {
    const list = tableData.slice()

    const sum = {}
    let totalText = ''
    let lowerCaseFont = ''
    _.each(fields, v => {
      sum[v.name] = sumData(list, v.valueField)
    })
    for (const name in sum) {
      const price = sum[name]
      // 大写文案
      const upperCaseFont = get(
        subtotal,
        SHOW_ORDER_CASE_ENUM.order_needUpperCase
      )
        ? `${orderUpperCaseText}${TWO_TEXT_SPACE}` + coverDigit2Uppercase(price)
        : ''
      // 小写文案
      lowerCaseFont = get(subtotal, SHOW_ORDER_CASE_ENUM.order_needLowerCase)
        ? `${orderLowerCaseText}${TWO_TEXT_SPACE}${price}`
        : ''
      // 大小文字合并
      totalText =
        orderFontSort === 'small'
          ? `${lowerCaseFont}${
              order_needLowerCase && order_needUpperCase ? TEXT_SPACE : ''
            }${upperCaseFont}`
          : `${upperCaseFont}${
              order_needUpperCase && order_needLowerCase ? TEXT_SPACE : ''
            }${lowerCaseFont}`
    }
    return (
      <tr>
        <td
          colSpan={1}
          style={{
            whiteSpace: 'nowrap',
            fontWeight: 'bold',
            textAlign: 'center'
          }}
          dangerouslySetInnerHTML={{
            __html: orderSummaryText
          }}
        />
        <td
          colSpan={99}
          style={{
            fontWeight: 'bold',
            ...style
          }}
          dangerouslySetInnerHTML={{
            __html: totalText
          }}
        />
      </tr>
    )
  } else {
    return null
  }
}
AllOrderSummary.propTypes = {
  config: PropTypes.object.isRequired,
  range: PropTypes.object.isRequired,
  printerStore: PropTypes.object
}

export default observer(AllOrderSummary)
