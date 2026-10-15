import i18next from '../../locales'
import React from 'react'
import CommonContextMenu from '../common/common_context_menu'
import { inject, observer } from 'mobx-react'
import { Printer } from '../printer'
import { regExp } from '../util'
import PropTypes from 'prop-types'

const blockTypeList = [
  { value: '', text: i18next.t('插入文本') },
  { value: 'line', text: i18next.t('插入线条') },
  { value: 'image', text: i18next.t('插入图片') },
  { value: 'remark', text: i18next.t('插入备注') }
]

// 预览配置翻译：把编辑器侧的 orderSummary 开关翻译成打印侧的 allOrderSummaryConfig，
// 使编辑预览能实时看到整单合计行（仅预览派生，不入 onSave 持久化）。
// 可汇总列 = 表体全部 {{列.*}} 模板列中排除文本列（班级名称/配送内容/备注）。
const buildPreviewConfig = config => {
  const content = config.contents?.find(v => v.dataKey === '1')
  if (
    !content ||
    content.tableType !== 'horizontal_product' ||
    !content.orderSummary?.show
  ) {
    return config
  }
  // weightDivisor 未配置（undefined）= 不换算，与打印侧 modifyTemplate 口径一致
  const hasDivisor = content.weightDivisor !== undefined
  const excluded = ['班级名称', '配送内容', '备注']
  const summableKeys = (content.columns || [])
    .map(c => (c.text || '').match(/^\{\{列\.(.+)}}$/) && regExp(c.text))
    .filter(key => key && !excluded.includes(key))
  return {
    ...config,
    contents: config.contents.map(v =>
      v.dataKey === '1'
        ? {
            ...v,
            allOrderSummaryConfig: {
              // 生产配置形态对齐 delivery_template（PageOrderSummary 消费）
              orderSummaryShow: true,
              // 2026-10-14 需求确认：整单合计仅末页显示，每页显示选项已移除
              isShowOrderSummaryPer: false,
              showOrderType: 'bottom',
              orderSummaryText: i18next.t('整单合计'),
              fields: summableKeys.map(name => ({ name, valueField: name })),
              // 组件对每项做 regExp 提取，需传模板串形式
              summaryOrderColumns: summableKeys.map(name => `{{列.${name}}}`),
              // 仅整单合计行做重量换算（重量列才配系数；÷0/×0 结果为 0）
              ...(hasDivisor
                ? {
                    sumConvertByField: summableKeys
                      .filter(name => name !== '配餐人数')
                      .reduce((acc, name) => {
                        acc[name] = {
                          value: Number(content.weightDivisor) || 0,
                          operator:
                            content.weightOperator === 'multiply'
                              ? 'multiply'
                              : 'divide'
                        }
                        return acc
                      }, {})
                  }
                : {}),
              style: { textAlign: 'center', fontSize: '12px' }
            }
          }
        : v
    )
  }
}

@inject(stores => ({
  editStore: stores.editStore,
  mockData: stores.mockData
}))
@observer
class ContextMenu extends React.Component {
  render() {
    const { editStore, mockData, uploadQiniuImage } = this.props
    return (
      <CommonContextMenu
        insertBlockList={blockTypeList}
        uploadQiniuImage={uploadQiniuImage}
        type='eshop'
      >
        <Printer
          key={editStore.computedPrinterKey}
          selected={editStore.selected}
          selectedRegion={editStore.selectedRegion}
          config={buildPreviewConfig(editStore.config)}
          data={mockData}
        />
      </CommonContextMenu>
    )
  }
}

ContextMenu.propTypes = {
  config: PropTypes.object.isRequired,
  editStore: PropTypes.func,
  uploadQiniuImage: PropTypes.func,
  mockData: PropTypes.object.isRequired
}
export default ContextMenu
