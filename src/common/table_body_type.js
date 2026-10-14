// 学生餐配送单「表体类型」纯计算：商品横向表（行=班级、列=菜品动态生成）
// 注意：本文件不得引入 mobx / React / JSX，保持 node --test 可测
const TABLE_BODY_TYPE = {
  VERTICAL: 'vertical',
  HORIZONTAL_PRODUCT: 'horizontal_product'
}

// 横向表「菜品」占位列：打印/预览时被动态菜品列替换
const DISH_ANCHOR_TEXT = '{{列.菜品}}'

const isHorizontalProduct = content =>
  content && content.tableType === TABLE_BODY_TYPE.HORIZONTAL_PRODUCT

// 切换到横向表时剔除非白名单列；空文本列（自定义/签字）保留
const filterHorizontalColumns = (columns, keepTexts) =>
  (columns || []).filter(c => !c.text || keepTexts.includes(c.text))

module.exports = {
  TABLE_BODY_TYPE,
  DISH_ANCHOR_TEXT,
  isHorizontalProduct,
  filterHorizontalColumns
}
