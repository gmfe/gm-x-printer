/*
 * @creater: suxin suxin@guanmai.cn
 * @since: 2022-09-01 14:33:53
 * @lastTime: 2022-09-09 16:23:17
 * @LastAuthor: suxin suxin@guanmai.cn
 * @文件相对于项目的路径: /gm-x-printer/src/printer/table_subtoal_tr_showRow.js
 * @message: 每页合计_整行展现
 */
import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
// eslint-disable-next-line import/named
import { MULTI_SUFFIX, SHOW_WAY_ENUM, SHOW_PAGE_CASE_ENUM } from '../config'
import Big from 'big.js'
import { coverDigit2Uppercase, getDataKey } from '../util'
import { observer } from 'mobx-react'
import { get } from 'mobx'

/**
 * 每页合计组件,分页计算后,根据range来统计每页合计数据
 * @param props
 * @returns {*}
 */
const SubtotalTrShowRow = props => {
  const {
    config,
    config: { dataKey, arrange, subtotal },
    range,
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
          // parseFloat:取值的时候可能返回来的值可能带有单位
          result = result.plus(parseFloat(b[field + MULTI_SUFFIX]))
        }
        return result
      },
      Big(0)
    ).toFixed(2)
  }
  const summaryConfig = get(config, 'summaryConfig')
  const { needUpperCase, needLowerCase } = subtotal

  const {
    pageSummaryShow,
    showPageType,
    fields,
    pageUpperCaseText,
    pageFontSort,
    pageLowerCaseText,
    style,
    pageSummaryText
  } = summaryConfig

  // 每页小计
  if (
    pageSummaryShow &&
    showPageType === SHOW_WAY_ENUM.row &&
    printerStore.ready
  ) {
    const list = tableData.slice(range.begin, range.end)
    // 是否是打印全部商品
    // 打印全部商品不需要计算子商品
    const isAllProduct = get(config, 'dataKey') === 'allprod'
    console.log(4444, isAllProduct)

    const sum = {}
    let lowerCaseFont = ''
    let upperCaseFont = ''
    _.each(fields, v => {
      sum[v.name] = sumData(list, v.valueField, isAllProduct)
    })
    for (const name in sum) {
      const price = sum[name]
      // 大写文案

      // 大写文案
      upperCaseFont = get(subtotal, SHOW_PAGE_CASE_ENUM.needUpperCase)
        ? `${pageUpperCaseText}` + coverDigit2Uppercase(price)
        : ''
      // 小写文案

      lowerCaseFont = get(subtotal, SHOW_PAGE_CASE_ENUM.needLowerCase)
        ? `${pageLowerCaseText}${price}`
        : ''
    }
    const renderTotalText = () => {
      const lower = <span>{lowerCaseFont}</span>
      const upper = <span>{upperCaseFont}</span>
      const space = <span style={{ width: '20%', display: 'inline-block' }} />
      return pageFontSort === 'small' ? (
        <>
          {lower}
          {needLowerCase && needUpperCase ? space : ''}
          {upper}
        </>
      ) : (
        <>
          {upper}
          {needUpperCase && needLowerCase ? space : ''}
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
            __html: pageSummaryText
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

SubtotalTrShowRow.propTypes = {
  config: PropTypes.object.isRequired,
  range: PropTypes.object.isRequired,
  printStore: PropTypes.object
}

export default observer(SubtotalTrShowRow)
