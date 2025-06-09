import i18next from '../../locales'

/** 采购明细列 模版TEXT */
const DETAIL_CONFIG_TEXT = i18next.t(
  '{{需求数_下单单位}}{{下单单位}}（{{客户名称}}）'
)

/** 单列换行-下单数（客户） */
export const SORTING_DETAIL = {
  head: i18next.t('明细'),
  headStyle: { textAlign: 'center' },
  style: { textAlign: 'left' },
  isSpecialColumn: true,
  separator: '+',
  specialDetailsKey: '__details',
  text: DETAIL_CONFIG_TEXT
}

/** 单列不换行-下单数（客户） */
export const SORTING_DETAIL_NO_BREAK = {
  head: i18next.t('明细'),
  headStyle: { textAlign: 'center' },
  style: { textAlign: 'left' },
  isSpecialColumn: true,
  separator: '+',
  specialDetailsKey: '__details',
  text: DETAIL_CONFIG_TEXT
}

export const SORTING_NO_DETAIL = {
  head: i18next.t('客户1'),
  headStyle: { textAlign: 'center' },
  style: { textAlign: 'left' },
  text: '{{列.需求数_下单单位_0}}',
  isCustomerColumn: true
}

/** 按下单单位汇总的采购明细  */
export const PURCHASE_DETAIL_BY_ORDER_UNIT = dataKey => {
  const PURCHASE_COL =
    dataKey === 'purchase_last_col' ? SORTING_DETAIL : SORTING_DETAIL_NO_BREAK
  return [
    {
      head: i18next.t('下单单位'),
      headStyle: { textAlign: 'center' },
      isPurchaseDetailByOrderUnit: true,
      style: { textAlign: 'center' },
      text: i18next.t('{{列.下单单位}}')
    },
    {
      head: i18next.t('需求总数(下单单位)'),
      headStyle: { textAlign: 'center' },
      isPurchaseDetailByOrderUnit: true,

      style: { textAlign: 'center' },
      text: i18next.t('{{列.需求总数_下单单位}}{{列.下单单位}}')
    },
    {
      ...PURCHASE_COL,
      isPurchaseDetailByOrderUnit: true
    }
  ]
}

/** 插入操作 */
export const BLOCK_TYPE_LIST = [
  { value: '', text: i18next.t('插入文本') },
  { value: 'line', text: i18next.t('插入线条') },
  { value: 'image', text: i18next.t('插入图片') }
]

/** 设置采购明细显示 options */

export const SORTING_DETAIL_SHOW_OPTIONS = [
  { value: 'purchase_no_detail', text: i18next.t('多列-每个客户单列') },
  { value: 'purchase_last_col', text: i18next.t('单列换行-下单数（客户）') },
  {
    value: 'purchase_last_col_noLineBreak',
    text: i18next.t('单列不换行-下单数（客户）')
  }
]
