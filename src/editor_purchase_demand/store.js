import EditorStore from '../common/editor_store'
import { action } from 'mobx'

export const StatisticsSettingEnum = {
  /** 列表合计 */
  LIST: 1,
  /** 列表小计 */
  LIST_SUBTOTAL: 2
}

class Store extends EditorStore {
  @action
  setStatisticsSetting(statisticsSetting) {
    this.config = {
      ...this.config,
      statisticsSetting
    }
  }
}

export default new Store()
