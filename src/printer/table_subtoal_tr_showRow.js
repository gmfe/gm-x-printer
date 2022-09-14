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
import {
  MULTI_SUFFIX,
  TEXT_SPACE,
  TWO_TEXT_SPACE,
  SHOW_WAY_ENUM,
  SHOW_PAGE_CASE_ENUM
} from '../config'
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
  const sumData = (list, field) => {
    return _.reduce(
      list,
      (a, b) => {
        let result = a

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
    const sum = {}
    let totalText = ''
    let lowerCaseFont = ''
    _.each(fields, v => {
      sum[v.name] = sumData(list, v.valueField)
    })
    for (const name in sum) {
      const price = sum[name]
      // 大写文案
      const upperCaseFont = get(subtotal, SHOW_PAGE_CASE_ENUM.needUpperCase)
        ? `${pageUpperCaseText}${TWO_TEXT_SPACE}` + coverDigit2Uppercase(price)
        : ''
      // 小写文案
      lowerCaseFont = get(subtotal, SHOW_PAGE_CASE_ENUM.needLowerCase)
        ? `${pageLowerCaseText}${TWO_TEXT_SPACE}${price}`
        : ''
      // 大小文字合并
      totalText =
        pageFontSort === 'small'
          ? `${lowerCaseFont}${
              needLowerCase && needUpperCase ? TEXT_SPACE : ''
            }${upperCaseFont}`
          : `${upperCaseFont}${
              needUpperCase && needLowerCase ? TEXT_SPACE : ''
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
            __html: pageSummaryText
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

SubtotalTrShowRow.propTypes = {
  config: PropTypes.object.isRequired,
  range: PropTypes.object.isRequired,
  printStore: PropTypes.object
}

export default observer(SubtotalTrShowRow)
