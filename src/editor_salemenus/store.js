import EditorStore from '../common/editor_store'
import { action, computed } from 'mobx'

class Store extends EditorStore {
  @computed
  get computedTableDataKeyOfSelectedRegion() {
    if (this.selectedRegion) {
      const arr = this.selectedRegion.split('.')
      if (arr.includes('table')) {
        const dataKey = this.config.contents[arr[2]].dataKey
        return dataKey
      }
    }
  }

  /**
   * 当前是不是选中组合商品的表格
   */
  @computed
  get isSelectingCombine() {
    return (
      !!this.selectedRegion &&
      this.config.contents[
        this.selectedRegion?.match(/contents.table.(\d)/)?.[1]
      ]?.id === 'combine'
    )
  }

  @action
  initCombine() {
    // 不展示组合详情
    if (!this.config.combineSkuDetail.show) {
      this.config = {
        ...this.config,
        contents: this.config.contents.filter(c => c.id !== 'combine')
      }
    } else {
      if (this.config.ingredientDetail.show) {
        // 展示子商品详情
        this.config = {
          ...this.config,
          contents: this.config.contents.filter(
            c => !(c.id === 'combine' && c.dataKey === 'combine_withoutIg')
          )
        }
      } else {
        this.config = {
          ...this.config,
          contents: this.config.contents.filter(
            c => !(c.id === 'combine' && c.dataKey === 'combine_withIg')
          )
        }
      }
    }
  }
}

export default new Store()
