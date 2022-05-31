import EditorStore from '../common/editor_store'
import defaultTableConfigRecord from './default_table_config'
import _ from 'lodash'

class Store extends EditorStore {
  defaultTableDataKey = 'orders'

  setTableDataKeyEffect(target, dataKey) {
    if (_.has(defaultTableConfigRecord, dataKey)) {
      target.columns = defaultTableConfigRecord[dataKey]
    }
  }
}

export default new Store()
