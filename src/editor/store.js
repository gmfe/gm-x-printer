import EditorStore from '../common/editor_store'
import i18next from '../../locales'
import { action } from 'mobx'

class Store extends EditorStore {
  // 复写父类方法
  setTableDataKeyEffect(target, dataKey) {
    switch (dataKey) {
      case 'combination': {
        target.columns = [
          {
            head: i18next.t('序号'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.序号}}')
          },
          {
            head: i18next.t('商品名'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.组合商品_名}}')
          },
          {
            head: i18next.t('商品编码'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.组合商品_自定义编码}}')
          },
          {
            head: i18next.t('包装单位'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.组合商品_包装单位}}')
          },
          {
            head: i18next.t('下单数'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.组合商品_下单数}}')
          },
          {
            head: i18next.t('单价'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.组合商品_单价}}')
          },
          {
            head: i18next.t('下单金额'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.组合商品_下单金额}}')
          }
        ]
        break
      }
      case 'reward': {
        target.columns = [
          {
            head: i18next.t('积分商品名'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.积分商品名}}')
          },
          {
            head: i18next.t('规格'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.规格}}')
          },
          {
            head: i18next.t('兑换数'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.兑换数}}')
          },
          {
            head: i18next.t('消耗积分'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.消耗积分}}')
          }
        ]
        break
      }
      case 'abnormal': {
        target.columns = [
          {
            head: i18next.t('商品名'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.商品名}}')
          },
          {
            head: i18next.t('异常原因'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.异常原因}}')
          },
          {
            head: i18next.t('异常数量'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.异常数量}}')
          },
          {
            head: i18next.t('异常金额'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.异常金额}}')
          }
        ]
        break
      }
      case 'orders': {
        target.columns = [
          {
            head: i18next.t('序号'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.序号}}')
          },
          {
            head: i18next.t('类别'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.类别}}')
          },
          {
            head: i18next.t('商品名'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.商品名}}')
          },
          {
            head: i18next.t('规格'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.规格}}')
          },
          {
            head: i18next.t('下单数'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.下单数}}{{列.销售单位}}')
          },
          {
            head: i18next.t('出库数(基本单位)'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.出库数_基本单位}}{{列.基本单位}}')
          },
          {
            head: i18next.t('单价(基本单位)'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.单价_基本单位}}')
          },
          {
            head: i18next.t('出库金额'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.出库金额}}')
          }
        ]
        break
      }
      case 'allprod': {
        target.columns = [
          {
            head: i18next.t('序号'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.序号}}')
          },
          {
            head: i18next.t('类别'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.类别}}')
          },
          {
            head: i18next.t('商品名'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.商品名}}')
          },
          {
            head: i18next.t('规格'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.规格}}')
          },
          {
            head: i18next.t('下单数'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.下单数}}{{列.销售单位}}')
          },
          {
            head: i18next.t('出库数(基本单位)'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.出库数_基本单位}}{{列.基本单位}}')
          },
          {
            head: i18next.t('单价(基本单位)'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.单价_基本单位}}')
          },
          {
            head: i18next.t('出库金额'),
            headStyle: {
              textAlign: 'center'
            },
            style: {
              textAlign: 'center'
            },
            text: i18next.t('{{列.出库金额}}')
          }
        ]
        break
      }
      default:
    }
  }

  @action.bound
  addContent(name, index, type) {
    const arr = name.split('.')
    // 添加之前清除selected,否则content改变之后,computedSelectedSource会计算错误
    this.selected = null
    if ((arr.length === 3 || arr.length === 5) && arr[0] === 'contents') {
      if (index >= 0 && index <= this.config.contents.length) {
        if (type === 'table') {
          this.config.contents.splice(index, 0, {
            className: '',
            type: 'table',
            dataKey: 'orders',
            subtotal: {
              show: false,
              needLowerCase: true,
              needUpperCase: true,
              order_needLowerCase: true,
              order_needUpperCase: true
            },
            summaryConfig: {
              pageSummaryShow: false,
              totalSummaryShow: false,
              style: {
                textAlign: 'center',
                fontSize: '12px'
              },
              summaryColumns: [],
              pageSummaryText: '合计',
              showPageType: 'row',
              showOrderType: 'row',
              chosePageSummaryField: '商品销售额',
              fields: [{ name: '{{列.商品销售额}}', valueField: '商品销售额' }],
              pageUpperCaseText: '大写：',
              pageLowerCaseText: '小写：',
              pageFontSort: 'big'
            },
            allOrderSummaryConfig: {
              fields: [{ name: '{{列.商品销售额}}', valueField: '商品销售额' }],
              style: {
                textAlign: 'center',
                fontSize: '12px'
              },
              orderSummaryShow: false,
              totalSummaryShow: false,
              summaryOrderColumns: [],
              orderSummaryText: '整单合计',
              showOrderType: 'row',
              orderUpperCaseText: '大写：',
              orderLowerCaseText: '小写：',
              orderFontSort: 'big',
              isShowOrderSummaryPer: false
            },
            columns: [
              {
                head: i18next.t('序号'),
                headStyle: {
                  textAlign: 'center'
                },
                style: {
                  textAlign: 'center'
                },
                text: '{{列.序号}}'
              },
              {
                head: i18next.t('表头'),
                headStyle: {
                  textAlign: 'center',
                  minWidth: '30px'
                },
                text: i18next.t('内容'),
                style: {
                  textAlign: 'center'
                }
              }
            ]
          })
        } else {
          this.config.contents.splice(index, 0, {
            blocks: [],
            style: {
              height: '100px'
            }
          })
        }
      }
    }
  }
}

export default new Store()
