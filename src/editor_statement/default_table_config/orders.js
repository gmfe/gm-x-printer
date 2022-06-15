import i18next from '../../../locales'

const ordersDefaultTableConfig = [
  {
    head: i18next.t('订单号'),
    headStyle: {
      textAlign: 'center'
    },
    style: {
      textAlign: 'center'
    },
    text: '{{列.订单号}}'
  },
  {
    head: i18next.t('下单时间'),
    headStyle: {
      textAlign: 'center'
    },
    style: {
      textAlign: 'center'
    },
    text: '{{列.下单时间}}'
  },
  {
    head: i18next.t('收货时间'),
    headStyle: {
      textAlign: 'center'
    },
    style: {
      textAlign: 'center'
    },
    text: '{{列.收货时间}}'
  },
  {
    head: i18next.t('业务类型'),
    headStyle: {
      textAlign: 'center'
    },
    style: {
      textAlign: 'center'
    },
    text: '{{列.业务类型}}'
  },
  {
    head: i18next.t('订单类型'),
    headStyle: {
      textAlign: 'center'
    },
    style: {
      textAlign: 'center'
    },
    text: '{{列.订单类型}}'
  },
  {
    head: i18next.t('支付状态'),
    headStyle: {
      textAlign: 'center'
    },
    style: {
      textAlign: 'center'
    },
    text: '{{列.支付状态}}'
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
  },
  {
    head: i18next.t('应付金额'),
    headStyle: {
      textAlign: 'center'
    },
    style: {
      textAlign: 'center'
    },
    text: '{{列.应付金额}}'
  },
  {
    head: i18next.t('已付金额'),
    headStyle: {
      textAlign: 'center'
    },
    style: {
      textAlign: 'center'
    },
    text: '{{列.已付金额}}'
  },
  {
    head: i18next.t('未付金额'),
    headStyle: {
      textAlign: 'center'
    },
    style: {
      textAlign: 'center'
    },
    text: '{{列.未付金额}}'
  },
  {
    head: i18next.t('售后金额'),
    headStyle: {
      textAlign: 'center'
    },
    style: {
      textAlign: 'center'
    },
    text: '{{列.售后金额}}'
  }
]

export default ordersDefaultTableConfig
