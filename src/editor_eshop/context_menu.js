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
  // weightDivisor 换算已下沉到打印页单元格层（2026-10-19 口径），编辑器预览合计
  // 与打印同口径：纯加法，不再注入 sumConvertByField
  const excluded = ['班级名称', '配送内容', '备注']
  const allKeys = (content.columns || [])
    .map(c => (c.text || '').match(/^\{\{列\.(.+)}}$/) && regExp(c.text))
    .filter(key => key && !excluded.includes(key))
  // 可汇总字段勾选（1158798739001058039）：summaryFields 未存（存量模板）默认全汇总；
  // 与打印侧 modifyTemplate 口径一致
  const fields = content.orderSummary.summaryFields
  const wantWeight = fields === undefined || fields.includes('商品总重量')
  const wantMealCount = fields === undefined || fields.includes('配餐人数')
  const summableKeys = allKeys.filter(name =>
    name === '配餐人数' ? wantMealCount : wantWeight
  )
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
  componentDidMount() {
    // editor_store.init 会把 isAutoFilling 重置为 false，模板重新打开时需从
    // config.autoFillConfig 恢复开关状态，否则 UI 显示关闭而 checked 仍为 true，
    // 预览/打印仍会填充空白行（TAPD 1158798739001093058 / 1158798739001093059）。
    // 只恢复运行时开关：不走 handleChangeTableData——它会以当前 selectedRegion
    // （挂载时为 undefined）覆盖 config.autoFillConfig，用户保存后 region 永久丢失，
    // 打印侧 computedTableCustomerRowHeight 回退默认行高、填充行数不准。
    // mock 填充行由 Printer 挂载流程负责（printer.js componentDidMount → changeTableData）
    const {
      editStore,
      editStore: {
        config: { autoFillConfig }
      }
    } = this.props

    if (autoFillConfig?.checked) {
      editStore.setAutoFillingConfig(autoFillConfig.checked)
    }
  }

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
          // 传入 isAutoFilling 让预览即时响应填充开关（否则只有 tableType 变化
          // 触发重挂载时才从 config 读到，表现为纵向表开启不生效、切横向表才生效）
          isAutoFilling={editStore.isAutoFilling}
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
