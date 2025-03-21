import React from 'react'
import i18next from '../../locales'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { MULTI_SUFFIX } from '../config'
import Big from 'big.js'
import { coverDigit2Uppercase, getDataKey } from '../util'
import { observer } from 'mobx-react'
import { get } from 'mobx'

/**
 * 每页合计（套账出库金额）组件,分页计算后,根据range来统计每页合计数据
 * @param props
 * @returns {*}
 */
const SubtotalSsuOtQuantityTr = props => {
  const {
    config: {
      dataKey,
      arrange,
      subtotal,
      subtotal: {
        isSsuOtQuantity,
        style,
        fields = [
          {
            name: i18next.t('套账出库金额'),
            valueField: '套账出库金额'
          }
        ],
        displayName = false // 是否展示字段名
      }
    },
    range,
    printerStore
  } = props

  const tableData =
    printerStore.data._table[
      getDataKey(dataKey, arrange, printerStore.tableVerticalStyle)
    ] || []
  // 计算合计
  const sumData = (list, field) => {
    return _.reduce(
      list,
      (a, b) => {
        let result = a

        result = a.plus(b[field] || 0)
        if (b[field + MULTI_SUFFIX]) {
          result = result.plus(b[field + MULTI_SUFFIX])
        }
        return result
      },
      Big(0)
    ).toFixed(2)
  }

  // 每页小计
  // isSsuOtQuantity 是否展示小计，fields<Array> 合计的字段和展现的name，displayName 是否显示名字
  if (isSsuOtQuantity && printerStore.ready) {
    const list = tableData.slice(range.begin, range.end)

    const sum = {}
    let subtotalStr = ''

    _.each(fields, v => {
      sum[v.name] = sumData(list, v.valueField)
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

SubtotalSsuOtQuantityTr.propTypes = {
  config: PropTypes.object.isRequired,
  range: PropTypes.object.isRequired,
  printStore: PropTypes.object
}

export default observer(SubtotalSsuOtQuantityTr)
