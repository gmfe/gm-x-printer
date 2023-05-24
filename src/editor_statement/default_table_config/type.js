import i18next from '../../../locales'

const skusDefaultTableConfig = [
  {
    head: i18next.t('商品一级分类'),
    headStyle: {
      textAlign: 'center'
    },
    style: {
      textAlign: 'center'
    },
    text: '{{列.商品一级分类}}'
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
    head: i18next.t('售后金额'),
    headStyle: {
      textAlign: 'center'
    },
    style: {
      textAlign: 'center'
    },
    text: '{{列.售后金额}}'
  }
  // {
  //   head: i18next.t('待售后金额'),
  //   headStyle: {
  //     textAlign: 'center'
  //   },
  //   style: {
  //     textAlign: 'center'
  //   },
  //   text: '{{列.待售后金额}}'
  // }
]

export default skusDefaultTableConfig
