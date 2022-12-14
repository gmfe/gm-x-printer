import i18next from '../locales'
export const pageTypeMap = {
  A4: {
    name: 'A4(210x297)',
    size: {
      width: '210mm',
      height: '297mm'
    },
    gap: {
      paddingTop: '8mm',
      paddingRight: '8mm',
      paddingBottom: '8mm',
      paddingLeft: '8mm'
    }
  },
  A5: {
    name: 'A5(148x210)',
    size: {
      width: '148mm',
      height: '210mm'
    },
    gap: {
      paddingTop: '5mm',
      paddingRight: '5mm',
      paddingBottom: '5mm',
      paddingLeft: '5mm'
    }
  },
  'A4/2': {
    name: i18next.t('二分纸(210x140)'),
    size: {
      width: '210mm',
      height: '140mm'
    },
    gap: {
      paddingTop: '5mm',
      paddingRight: '5mm',
      paddingBottom: '5mm',
      paddingLeft: '5mm'
    }
  },
  'A4/3': {
    name: i18next.t('三分纸(210x93)'),
    size: {
      width: '210mm',
      height: '93mm'
    },
    gap: {
      paddingTop: '5mm',
      paddingRight: '5mm',
      paddingBottom: '5mm',
      paddingLeft: '5mm'
    }
  },
  '241x280': {
    name: '241x280',
    size: {
      width: '241mm',
      height: '280mm'
    },
    gap: {
      paddingTop: '5mm',
      paddingRight: '16mm',
      paddingBottom: '5mm',
      paddingLeft: '16mm'
    }
  },
  '241x140': {
    name: '241x140',
    size: {
      width: '241mm',
      height: '140mm'
    },
    gap: {
      paddingTop: '5mm',
      paddingRight: '16mm',
      paddingBottom: '5mm',
      paddingLeft: '16mm'
    }
  },
  DIY: {
    name: i18next.t('自定义纸张'),
    size: {
      width: '210mm',
      height: '297mm'
    },
    gap: {
      paddingTop: '5mm',
      paddingRight: '5mm',
      paddingBottom: '5mm',
      paddingLeft: '5mm'
    }
  }
}

export const printDirectionList = [
  { value: 'vertical', text: i18next.t('纵向') },
  { value: 'horizontal', text: i18next.t('横向') }
]

export const borderStyleList = [
  { value: 'solid', text: i18next.t('实线') },
  { value: 'dashed', text: i18next.t('虚线') },
  { value: 'dotted', text: i18next.t('圆点') }
]

export const tableClassNameList = [
  { value: '', text: i18next.t('默认样式') },
  { value: 'className0', text: i18next.t('浅实线样式') },
  { value: 'className1', text: i18next.t('无实线样式') }
]

export const tableDataKeyList = [
  { value: 'orders', text: i18next.t('全部商品') },
  { value: 'abnormal', text: i18next.t('异常商品') }
]

export const blockTypeList = [
  { value: '', text: i18next.t('插入文本') },
  { value: 'line', text: i18next.t('插入线条') },
  { value: 'image', text: i18next.t('插入图片') },
  { value: 'counter', text: i18next.t('插入分类汇总') },
  { value: 'barcode', text: i18next.t('插入订单条形码') },
  { value: 'qrcode', text: i18next.t('插入订单溯源二维码') }
]

export const DiyTimeType = [
  {
    type: '',
    text: '格式“2022-01-01 19:00:00”，输入“单据日期：{{单据日期}}”；',
    format: 'YYYY-MM-DD HH:mm:ss'
  },
  {
    type: '时分',
    text: '格式“2022-01-01 19:00”，输入“单据日期：{{单据日期_时分}}”；',
    format: 'YYYY-MM-DD HH:mm'
  },
  {
    type: '日期',
    text: '格式“2022-01-01”，输入“单据日期：{{单据日期_日期}}”；',
    format: 'YYYY-MM-DD'
  },
  {
    type: '无年份',
    text: '格式“01-01 19:00:00”，输入“单据日期：{{单据日期_无年份}}”；',
    format: 'MM-DD HH:mm:ss'
  },
  {
    type: '日期_无年份',
    text: '格式“01-01”，输入“单据日期：{{单据日期_日期_无年份}}"；',
    format: 'MM-DD'
  },
  {
    type: '时间',
    text: '格式“19:00:00"，输入“单据日期：{{单据日期_时间}}"；',
    format: 'HH:mm:ss'
  },
  {
    type: '日期_星期',
    text: '格式“2022-01-01 星期六”，输入“单据日期：{{单据日期_日期_星期}}”；',
    format: 'YYYY-MM-DD dddd'
  }
]

export const TEMPLATE_SHOW_STYLE_LIST = [
  {
    text: '在每列底部展现',
    value: 'bottom'
  },
  {
    text: '整行展现',
    value: 'row'
  }
]

export const SORT_BY_BIG_OR_SMALL = [
  { text: '小写在前', value: 'small' },
  { text: '大写在前', value: 'big' }
]

export const TYPE_ENUM = {
  text_small: '展现小写',
  text_big: '展现大写'
}

export const STYLE_ENUM = {
  page_bottom_style: 'page_bottom_style',
  order_row_style: 'order_row_style'
}

export const SHOW_ENUM = {
  pageSummary: 'pageSummary',
  orderSumary: 'orderSumary'
}
export const CHOSE_FIELD_ENUM = {
  page_chose_field: 'page_chose_field',
  order_chose_field: 'order_chose_field'
}

export const SHOW_WAY_ENUM = {
  row: 'row',
  bottom: 'bottom'
}
export const SHOW_PAGE_CASE_ENUM = {
  needLowerCase: 'needLowerCase',
  needUpperCase: 'needUpperCase'
}
export const SHOW_ORDER_CASE_ENUM = {
  order_needLowerCase: 'order_needLowerCase',
  order_needUpperCase: 'order_needUpperCase'
}
export const PAGE_CHECKBOX = 'page_checkbox'

export const COM_STYLE = { color: '#848586', fontSize: 12 }

export const PAGE_TEXT = '每页合计'

export const MULTI_SUFFIX = '_MULTI_SUFFIX'
