import i18next from '../../../locales'

const orderTypeDefaultTableConfig = [
  {
    head: i18next.t('下单日期_按天'),
    headStyle: {
      textAlign: 'center'
    },
    style: {
      textAlign: 'center'
    },
    text: '{{列.下单日期_按天}}'
  },
  {
    head: i18next.t('下单金额'),
    headStyle: {
      textAlign: 'center'
    },
    style: {
      textAlign: 'center'
    },
    text: '{{列.下单金额}}'
  },
  {
    head: i18next.t('出库金额'),
    headStyle: {
      textAlign: 'center'
    },
    style: {
      textAlign: 'center'
    },
    text: '{{列.出库金额}}'
  }
]

export default orderTypeDefaultTableConfig
