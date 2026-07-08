import React from 'react'
import i18next from '../../locales'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { MULTI_SUFFIX } from '../config'
import Big from 'big.js'
import { coverDigit2Uppercase, getDataKey, isMultiTable } from '../util'
import { observer } from 'mobx-react'
import { get } from 'mobx'

/**
 * 每页合计（套账下单金额）组件,分页计算后,根据range来统计每页合计数据
 * @param props
 * @returns {*}
 */
const SubtotalSsuQuantityTr = props => {
  const {
    config: {
      dataKey,
      arrange,
      subtotal,
      subtotal: {
        isSsuQuantity,
        style,
        fields = [
          {
            name: i18next.t('套账下单金额'),
            valueField: '套账下单金额'
          }
        ],
        displayName = false // 是否展示字段名
      }
    },
    range,
    printerStore
  } = props

  const _dataKey = getDataKey(dataKey, arrange, printerStore.tableVerticalStyle)
  const tableData = printerStore.data._table[_dataKey] || []
  // 仅双栏(multi)table 的行会携带 _MULTI_SUFFIX 字段(右栏商品)，合计时才需要累加
  const isMulti = isMultiTable(_dataKey)
  // 计算合计
  const sumData = (list, field, isMulti) => {
    return _.reduce(
      list,
      (a, b) => {
        let result = a

        result = a.plus(b[field] || 0)
        // 仅双栏(multi)table 的行会携带 _MULTI_SUFFIX 字段(右栏商品)，累加才是对的；
        // 单栏明细行不显示该字段，无条件累加会把上游脏数据/历史残留算进合计，导致合计虚高
        if (isMulti && b[field + MULTI_SUFFIX]) {
          result = result.plus(b[field + MULTI_SUFFIX])
        }
        return result
      },
      Big(0)
    ).toFixed(2)
  }

  // 每页小计
  // isSsuQuantity 是否展示小计，fields<Array> 合计的字段和展现的name，displayName 是否显示名字
  if (isSsuQuantity && printerStore.ready) {
    const list = tableData.slice(range.begin, range.end)

    const sum = {}
    let subtotalStr = ''

    _.each(fields, v => {
      sum[v.name] = sumData(list, v.valueField, isMulti)
    })

    for (const name in sum) {
      const price = sum[name]
      const priceUpperCase = get(subtotal, 'needUpperCase') // needUpperCase在初始模板中undefined,所以必须用这个方法
        ? '大写：' + coverDigit2Uppercase(price)
        : ''
      if (displayName) {
        subtotalStr += `${name}&nbsp;${price}&nbsp;&nbsp;&nbsp;${priceUpperCase}&nbsp;&nbsp;&nbsp;&nbsp;`
      } else {
        subtotalStr += `${price}&nbsp;&nbsp;&nbsp;${priceUpperCase}&nbsp;&nbsp;&nbsp;&nbsp;`
      }
    }

    return (
      <tr>
        <td
          colSpan={99}
          style={{ fontWeight: 'bold', ...style }}
          dangerouslySetInnerHTML={{
            __html: `${i18next.t('每页合计')}：${subtotalStr}`
          }}
        />
      </tr>
    )
  } else {
    return null
  }
}

SubtotalSsuQuantityTr.propTypes = {
  config: PropTypes.object.isRequired,
  range: PropTypes.object.isRequired,
  printStore: PropTypes.object
}

export default observer(SubtotalSsuQuantityTr)
