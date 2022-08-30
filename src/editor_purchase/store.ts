import EditorStore from '../common/editor_store'
import { action } from 'mobx'
import { PURCHASE_DETAIL, PURCHASE_DETAIL_ROW_SPAN } from './constants'

class Store extends EditorStore {
  constructor({ defaultTableDataKey }) {
    super()
    this.defaultTableDataKey = defaultTableDataKey // 修改默认dataKey
  }

  /* start---------设置采购明细相关--------- */
  @action.bound
  setPurchaseTableKey(dataKey) {
    // 先移除选中项,安全第一
    this.selected = null
    this.setTableDataKey(dataKey)

    const arr = this.selectedRegion.split('.')
    const tableConfig = this.config.contents[arr[2]]

    // 先去掉所有明细列
    const newCols = tableConfig.columns.filter(
      o => !o.isPurchaseDetailRowSpan && !o.isSpecialColumn
    )
    tableConfig.columns.replace(newCols)
    this.changeSheetUnitSummary(false)

    // 单列-总表最后一列,在columns上修改
    if (dataKey === 'purchase_last_col') {
      tableConfig.columns.push(PURCHASE_DETAIL)
    }
  }

  @action.bound
  changeSheetUnitSummary(bool) {
    // this.isSheetUnitSummary = bool
    this.config.isSheetUnitSummary = bool
  }

  @action.bound
  setSheetUnitSummary(bool) {
    this.changeSheetUnitSummary(bool)
    const arr = this.selectedRegion.split('.')
    const tableConfig = this.config.contents[arr[2]]
    const newCols = tableConfig.columns.filter(
      o => !o.isPurchaseDetailRowSpan && !o.isSpecialColumn
    )
    if (bool) {
      // 先去掉所有明细列
      tableConfig.columns.replace(newCols)
      tableConfig.columns.push(...PURCHASE_DETAIL_ROW_SPAN)
    } else {
      tableConfig.columns.replace(newCols)
      tableConfig.columns.push(PURCHASE_DETAIL)
    }
  }

  @action.bound
  setSpecialText(value) {
    const arr = this.selectedRegion.split('.')
    const tableConfig = this.config.contents[arr[2]]

    tableConfig.specialConfig.template_text = value
    // 单列-总表最后一列,在columns上修改
    if (tableConfig.dataKey === 'purchase_last_col') {
      const specialCol = tableConfig.columns.find(o => o.isSpecialColumn)
      specialCol.text = value
    }
  }

  @action.bound
  setSpecialStyle(value) {
    const arr = this.selectedRegion.split('.')
    const tableConfig = this.config.contents[arr[2]]

    tableConfig.specialConfig.style = value
    // 单列-总表最后一列,在columns上修改
    if (tableConfig.dataKey === 'purchase_last_col') {
      const specialCol = tableConfig.columns.find(o => o.isSpecialColumn)
      specialCol.style = value
    }
  }

  @action.bound
  specialTextAddField(fieldText) {
    const arr = this.selectedRegion.split('.')
    const tableConfig = this.config.contents[arr[2]]

    tableConfig.specialConfig.template_text += fieldText
    // 单列-总表最后一列,在columns上修改
    if (tableConfig.dataKey === 'purchase_last_col') {
      const specialCol = tableConfig.columns.find(o => o.isSpecialColumn)
      specialCol.text += fieldText
    }
  }

  /* end---------设置采购明细相关--------- */
}

export default new Store({ defaultTableDataKey: 'purchase_no_detail' })
