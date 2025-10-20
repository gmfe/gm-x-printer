import { action, set, extendObservable, toJS } from 'mobx'
import {
  SORTING_DETAIL,
  SORTING_DETAIL_NO_BREAK,
  SORTING_NO_DETAIL
} from './constants'
import EditorStore from '../common/editor_store'

class Store extends EditorStore {
  constructor({ defaultTableDataKey }) {
    super()
    this.defaultTableDataKey = defaultTableDataKey // 修改默认dataKey
  }

  /* start---------设置采购明细相关--------- */
  @action.bound
  setPurchaseTableKey(dataKey, options) {
    // 先移除选中项,安全第一
    this.selected = null
    this.setTableDataKey(dataKey)

    const arr = this.selectedRegion.split('.')
    const tableConfig = this.config.contents[arr[2]]

    // 先去掉所有明细列
    const newCols = tableConfig.columns.filter(
      o =>
        !o.isPurchaseDetailByOrderUnit &&
        !o.isSpecialColumn &&
        !o.isCustomerColumn
    )
    tableConfig.columns.replace(newCols)
    // 单列-总表最后一列,在columns上修改
    this.changeSheetUnitSummary(false)
    if (
      dataKey === 'purchase_last_col' ||
      dataKey === 'purchase_last_col_noLineBreak'
    ) {
      tableConfig.columns.push(
        dataKey === 'purchase_last_col'
          ? SORTING_DETAIL
          : SORTING_DETAIL_NO_BREAK
      )
      dataKey === 'purchase_last_col'
        ? (tableConfig.columns[
            tableConfig.columns?.length - 1
          ].detailLastColType = 'purchase_last_col')
        : (tableConfig.columns[
            tableConfig.columns?.length - 1
          ].detailLastColType = 'purchase_last_col_noLineBreak')
    } else {
      tableConfig.columns.push(SORTING_NO_DETAIL)
      const { customerDetailFields } = options.addFields
      tableConfig.specialConfig.template_text = customerDetailFields
        ?.map(_item => {
          return _item.value
        })
        .join(' ')
      if (typeof tableConfig.isOpenMergeByDemand === 'undefined') {
        extendObservable(tableConfig, {
          isOpenMergeByDemand: false
        })
      }
    }
  }

  @action.bound
  changeSheetUnitSummary(bool) {
    this.config.isSheetUnitSummary = bool
  }

  @action.bound
  setSpecialText(value) {
    const arr = this.selectedRegion.split('.')
    const tableConfig = this.config.contents[arr[2]]
    tableConfig.specialConfig.template_text = value
    // 单列-总表最后一列,在columns上修改
    if (
      tableConfig.dataKey === 'purchase_last_col' ||
      tableConfig.dataKey === 'purchase_last_col_noLineBreak'
    ) {
      const specialCol = tableConfig.columns.find(o => o.isSpecialColumn)
      console.log(value, '123')
      specialCol.text = value
    }
  }

  @action.bound
  setSpecialStyle(value) {
    const arr = this.selectedRegion.split('.')
    const tableConfig = this.config.contents[arr[2]]

    tableConfig.specialConfig.style = value
    // 单列-总表最后一列,在columns上修改
    if (
      tableConfig.dataKey === 'purchase_last_col' ||
      tableConfig.dataKey === 'purchase_last_col_noLineBreak'
    ) {
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
    if (
      tableConfig.dataKey === 'purchase_last_col' ||
      tableConfig.dataKey === 'purchase_last_col_noLineBreak'
    ) {
      const specialCol = tableConfig.columns.find(o => o.isSpecialColumn)
      specialCol.text += fieldText
    }
  }

  @action.bound
  setIsOpenMergeByDemand(flag) {
    const arr = this.selectedRegion.split('.')
    const tableConfig = this.config.contents[arr[2]]
    /** 如果当前模版没有这个字段的话，该字段不是observer，会导致修改不了 */
    if (typeof tableConfig.isOpenMergeByDemand === 'undefined') {
      extendObservable(tableConfig, {
        isOpenMergeByDemand: flag
      })
    } else {
      set(tableConfig, {
        isOpenMergeByDemand: flag
      })
    }
  }
}

export default new Store({ defaultTableDataKey: 'sorting_detail' })
