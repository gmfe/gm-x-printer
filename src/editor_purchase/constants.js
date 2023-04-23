import i18next from '../../locales'

/** 采购明细列 模版TEXT */
const DETAIL_CONFIG_TEXT = i18next.t(
  '{{需求数_下单单位}}{{下单单位}}*{{需求数_采购单位}}{{采购单位}}*{{商户名}}*{{商品备注}}*{{对内备注}}'
)

/** 采购明细 */
export const PURCHASE_DETAIL = {
  head: i18next.t('明细'),
  headStyle: { textAlign: 'center' },
  style: { textAlign: 'left' },
  isSpecialColumn: true,
  specialDetailsKey: '__details',
  text: DETAIL_CONFIG_TEXT
}

/** 采购明细 */
export const PURCHASE_DETAIL_NO_BREAK = {
  head: i18next.t('明细'),
  headStyle: { textAlign: 'center' },
  style: { textAlign: 'left' },
  isSpecialColumn: true,
  separator: '+',
  specialDetailsKey: '__details',
  text: DETAIL_CONFIG_TEXT
}

/** 按下单单位汇总的采购明细  */
export const PURCHASE_DETAIL_BY_ORDER_UNIT = dataKey => {
  const PURCHASE_COL =
    dataKey === 'purchase_last_col' ? PURCHASE_DETAIL : PURCHASE_DETAIL_NO_BREAK
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

export const PURCHASE_DETAIL_SHOW_OPTIONS = [
  { value: 'purchase_no_detail', text: i18next.t('不打印明细') },
  { value: 'purchase_last_col', text: i18next.t('单列-总表最后一列（换行）') },
  {
    value: 'purchase_last_col_noLineBreak',
    text: i18next.t('单列-总表最后一列（不换行）')
  },
  { value: 'purchase_one_row', text: i18next.t('单列-总表下方一行') },
  { value: 'purchase_flex_2', text: i18next.t('双栏-总表下方一行两栏') },
  { value: 'purchase_flex_4', text: i18next.t('四栏-总表下方一行四栏') }
]
