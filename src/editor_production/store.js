import EditorStore from '../common/editor_store'
import { action } from 'mobx'
import _ from 'lodash'
import i18next from '../../locales'
class Store extends EditorStore {
  setTableDataKeyEffect(target, dataKey) {
    switch (dataKey) {
      // 物料的config
      case '1': {
        target.columns = [
          {
            head: i18next.t('序号'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.序号}}'),
            rowSpan: 'rowSpan',
            noRemove: 'isRemove' // 是否允许删除该列
          },
          {
            head: i18next.t('物料名称'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.物料名称}}'),
            noRemove: 'isRemove'
          },
          {
            head: i18next.t('理论用料数量（基本单位）'),
            headStyle: {
              width: '80px',
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.理论用料数量_基本单位}}')
          },
          // {
          //   head: i18next.t('物料工序'),
          //   headStyle: {
          //     textAlign: 'center'
          //   },
          //   style: {
          //     textAlign: 'center'
          //   },
          //   text: i18next.t('{{列.物料工序}}'),
          //   noRemove: 'isRemove'
          // },
          {
            head: i18next.t('理论产出数量（基本单位）'),
            headStyle: {
              width: '80px',
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.理论产出数量_基本单位}}')
          },

          {
            head: i18next.t('生产成品'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.生产成品}}'),
            noRemove: 'isRemove'
          }
        ]
        break
      }
      // 熟食生产成品的config
      case '2': {
        target.columns = [
          {
            head: i18next.t('序号'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.序号}}'),
            rowSpan: 'rowSpan',
            noRemove: 'isRemove'
          },
          {
            head: i18next.t('生产成品'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.生产成品}}'),
            noRemove: 'isRemove'
          },
          {
            head: i18next.t('计划生产_基本单位'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.计划生产_基本单位}}')
          },
          {
            head: i18next.t('组合工序'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.组合工序}}')
          },
          {
            head: i18next.t('物料名称'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.物料名称}}'),
            noRemove: 'isRemove'
          },
          {
            head: i18next.t('理论用料数量（基本单位）'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.理论用料数量_基本单位}}')
          }
        ]
        break
      }
      // 工序的config
      case '3': {
        target.columns = [
          {
            head: i18next.t('序号'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.序号}}'),
            rowSpan: 'rowSpan',
            noRemove: 'isRemove'
          },
          // {
          //   head: i18next.t('物料工序'),
          //   headStyle: {
          //     textAlign: 'center'
          //   },
          //   style: {
          //     textAlign: 'center'
          //   },
          //   text: i18next.t('{{列.物料工序}}'),
          //   noRemove: 'isRemove'
          // },
          // {
          //   head: i18next.t('组合工序'),
          //   headStyle: {
          //     textAlign: 'center'
          //   },
          //   style: {
          //     textAlign: 'center'
          //   },
          //   text: i18next.t('{{列.组合工序}}')
          // },
          {
            head: i18next.t('物料编码'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.物料编码}}')
          },
          {
            head: i18next.t('物料名称'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.物料名称}}'),
            noRemove: 'isRemove'
          },
          {
            head: i18next.t('理论用料数量（基本单位）'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.理论用料数量_基本单位}}')
          },
          {
            head: i18next.t('生产成品'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.生产成品}}'),
            noRemove: 'isRemove'
          }
        ]
        break
      }
      // 包装
      case '4': {
        target.columns = [
          {
            head: i18next.t('序号'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.序号}}'),
            rowSpan: 'rowSpan',
            noRemove: 'isRemove'
          },
          {
            head: i18next.t('生产成品'),
            headStyle: {
              textAlign: 'center',
              width: '100px'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.生产成品}}'),
            noRemove: 'isRemove'
          },
          {
            head: i18next.t('规格名称'),
            headStyle: {
              textAlign: 'center',
              width: '80px'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.规格名称}}')
          },
          {
            head: i18next.t('理论包装数量（包装单位）'),
            headStyle: {
              textAlign: 'center',
              width: '80px'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.理论包装数量_包装单位}}')
          },
          {
            head: i18next.t('指导配料'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.指导配料}}')
          },
          {
            head: i18next.t('物料名称'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.物料名称}}'),
            noRemove: 'isRemove'
          },
          {
            head: i18next.t('理论用料数量（基本单位）'),
            headStyle: {
              textAlign: 'center',
              width: '80px'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.理论用料数量_基本单位}}')
          }
        ]
        break
      }
      default:
    }
  }

  @action
  changeTableDataKeyStockout(name, key) {
    const arr = name.split('.')
    const { dataKey } = this.config.contents[arr[2]]
    const keyArr = dataKey.split('_')
    let newDataKey
    // 当前有这个key则去掉
    if (keyArr.includes(key)) {
      newDataKey = _.without(keyArr, key)
    } else {
      newDataKey = _.concat(keyArr, key)
    }
    newDataKey = _.sortBy(newDataKey, [
      o => o === 'money',
      o => o === 'quantity',
      o => o === 'multi',
      o => o === 'orders'
    ])

    this.config.contents[arr[2]].dataKey = newDataKey.join('_')
  }
}

export default new Store()
