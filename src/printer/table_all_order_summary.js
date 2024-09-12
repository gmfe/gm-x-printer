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
import { MULTI_SUFFIX, SHOW_WAY_ENUM, SHOW_ORDER_CASE_ENUM } from '../config'
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
  const sumData = (list, field, isAllProduct) => {
    return _.reduce(
      list,
      (a, b) => {
        let result = a
        // 子商品不能计算合计
        if (b['子商品'] && isAllProduct) {
          return a
        }
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
    let lowerCaseFont = ''
    let upperCaseFont = ''

    // 是否是打印全部商品
    // 打印全部商品不需要计算子商品
    const isAllProduct = get(config, 'dataKey') === 'allprod'
    _.each(fields, v => {
      sum[v.name] = sumData(list, v.valueField, isAllProduct)
    })
    for (const name in sum) {
      // 子商品不能计算合计
      const price = sum[name]
      // 大写文案
      upperCaseFont = get(subtotal, SHOW_ORDER_CASE_ENUM.order_needUpperCase)
        ? `${orderUpperCaseText}` + coverDigit2Uppercase(price)
        : ''
      // 小写文案
      lowerCaseFont = get(subtotal, SHOW_ORDER_CASE_ENUM.order_needLowerCase)
        ? `${orderLowerCaseText}${price}`
        : ''
    }

    const renderTotalText = () => {
      const lower = <span>{lowerCaseFont}</span>
      const upper = <span>{upperCaseFont}</span>
      const space = <span style={{ width: '20%', display: 'inline-block' }} />
      return orderFontSort === 'small' ? (
        <>
          {lower}
          {order_needLowerCase && order_needUpperCase ? space : ''}
          {upper}
        </>
      ) : (
        <>
          {upper}
          {order_needUpperCase && order_needLowerCase ? space : ''}
          {lower}
        </>
      )
    }
    return (
      <tr>
        <td
          colSpan={1}
          style={{
            whiteSpace: 'nowrap',
            fontWeight: 'bold',
            ...style,
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
        >
          <span>{renderTotalText()}</span>
        </td>
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
