import i18next from '../../locales'
import EditorStore from '../common/editor_store'
import { action } from 'mobx'

class Store extends EditorStore {
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
              summaryColumns: [
                '{{列.出库数}}',
                '{{列.申请退款数}}',
                '{{列.申请退款金额}}',
                '{{列.实退金额}}',
                '{{列.实退数}}',
                '{{列.可退数量}}'
              ],
              pageSummaryText: i18next.t('合计'),
              showPageType: 'bottom',
              showOrderType: 'row',
              chosePageSummaryField: '商品销售额',
              fields: [
                {
                  name: '{{列.商品销售额}}',
                  valueField: '商品销售额'
                }
              ],
              pageUpperCaseText: i18next.t('大写') + i18next.t('：'),
              pageLowerCaseText: i18next.t('小写') + i18next.t('：'),
              pageFontSort: 'big'
            },
            allOrderSummaryConfig: {
              fields: [
                {
                  name: '{{列.商品销售额}}',
                  valueField: '商品销售额'
                }
              ],
              style: {
                textAlign: 'center',
                fontSize: '12px'
              },
              orderSummaryShow: false,
              totalSummaryShow: false,
              summaryOrderColumns: [],
              orderSummaryText: i18next.t('整单合计'),
              showOrderType: 'row',
              orderUpperCaseText: i18next.t('大写') + i18next.t('：'),
              orderLowerCaseText: i18next.t('小写') + i18next.t('：'),
              orderFontSort: 'big',
              isShowOrderSummaryPer: false
            },
            columns: [
              {
                head: i18next.t('序号'),
                headStyle: {
                  textAlign: 'center',
                  width: '44px',
                  wordBreak: 'break-all'
                },
                text: '{{列.序号}}',
                style: {
                  textAlign: 'center',
                  wordBreak: 'break-all'
                }
              },
              {
                head: i18next.t('商品名'),
                headStyle: {
                  textAlign: 'center',
                  width: '85px',
                  wordBreak: 'break-all'
                },
                text: '{{列.商品名}}',
                style: {
                  textAlign: 'center',
                  wordBreak: 'break-all'
                }
              },
              {
                head: i18next.t('商品分类'),
                headStyle: {
                  textAlign: 'center',
                  width: '85px',
                  wordBreak: 'break-all'
                },
                text: '{{列.商品分类}}',
                style: {
                  textAlign: 'center',
                  wordBreak: 'break-all'
                }
              },
              {
                head: i18next.t('售后类型'),
                headStyle: {
                  textAlign: 'center',
                  width: '85px',
                  wordBreak: 'break-all'
                },
                text: '{{列.售后类型}}',
                style: {
                  textAlign: 'center',
                  wordBreak: 'break-all'
                }
              },
              {
                head: i18next.t('销售单价'),
                headStyle: {
                  textAlign: 'center',
                  width: '85px',
                  wordBreak: 'break-all'
                },
                text: '{{列.销售单价}}元/{{列.下单单位}}',
                style: {
                  textAlign: 'center',
                  wordBreak: 'break-all'
                }
              },
              {
                head: i18next.t('出库数'),
                headStyle: {
                  textAlign: 'center',
                  width: '85px',
                  wordBreak: 'break-all'
                },
                text: '{{列.出库数}}',
                style: {
                  textAlign: 'center',
                  wordBreak: 'break-all'
                }
              },
              {
                head: i18next.t('退款单价'),
                headStyle: {
                  textAlign: 'center',
                  width: '85px',
                  wordBreak: 'break-all'
                },
                text: `{{列.退款单价}}元/{{列.下单单位}}`,
                style: {
                  textAlign: 'center',
                  wordBreak: 'break-all'
                }
              },
              {
                head: i18next.t('申请退款数'),
                headStyle: {
                  textAlign: 'center',
                  width: '85px',
                  wordBreak: 'break-all'
                },
                text: '{{列.申请退款数}}',
                style: {
                  textAlign: 'center',
                  wordBreak: 'break-all'
                }
              },
              {
                head: i18next.t('申请退款金额'),
                headStyle: {
                  textAlign: 'center',
                  width: '85px',
                  wordBreak: 'break-all'
                },
                text: '{{列.申请退款金额}}',
                style: {
                  textAlign: 'center',
                  wordBreak: 'break-all'
                }
              },
              {
                head: i18next.t('实退数'),
                headStyle: {
                  textAlign: 'center',
                  width: '85px',
                  wordBreak: 'break-all'
                },
                text: '{{列.实退数}}',
                style: {
                  textAlign: 'center',
                  wordBreak: 'break-all'
                }
              },
              {
                head: i18next.t('实退金额'),
                headStyle: {
                  textAlign: 'center',
                  width: '85px',
                  wordBreak: 'break-all'
                },
                text: '{{列.实退金额}}',
                style: {
                  textAlign: 'center',
                  wordBreak: 'break-all'
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
