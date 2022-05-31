import i18next from '../../../locales'

const productDefaultTableConfig = [
  {
    head: i18next.t('商品名'),
    headStyle: {
      textAlign: 'center'
    },
    style: {
      textAlign: 'center'
    },
    text: '{{列.商品名}}'
  },
  {
    head: i18next.t('商品分类'),
    headStyle: {
      textAlign: 'center'
    },
    style: {
      textAlign: 'center'
    },
    text: '{{列.商品分类}}'
  },
  {
    head: i18next.t('下单单位'),
    headStyle: {
      textAlign: 'center'
    },
    style: {
      textAlign: 'center'
    },
    text: '{{列.下单单位}}'
  },
  {
    head: i18next.t('下单数'),
    headStyle: {
      textAlign: 'center'
    },
    style: {
      textAlign: 'center'
    },
    text: '{{列.下单数}}'
  },
  {
    head: i18next.t('出库数'),
    headStyle: {
      textAlign: 'center'
    },
    style: {
      textAlign: 'center'
    },
    text: '{{列.出库数}}'
  },
  {
    head: i18next.t('商品单价（均值）'),
    headStyle: {
      textAlign: 'center'
    },
    style: {
      textAlign: 'center'
    },
    text: '{{列.商品单价_均值}}'
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

export default productDefaultTableConfig
