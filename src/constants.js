import i18next from '../locales'

/** 批量打印设置文案枚举 */
export const BATCH_PRINTER_SETTING_TEXT_ENUM = {
  purchase_by_supplier: [
    i18next.t('不连续打印（一张采购单不出现多供应商）'),
    i18next.t('连续打印（一张采购单可能出现多个供应商）')
  ],
  purchase_by_category: [
    i18next.t('不连续打印（一张采购单不出现多个分类）'),
    i18next.t('连续打印（一张采购单可能出现多个分类）')
  ]
}
