// 学生餐配送单「表体类型」纯计算：商品横向表（行=班级、列=菜品动态生成）
// 注意：本文件不得引入 mobx / React / JSX，保持 node --test 可测
const TABLE_BODY_TYPE = {
  VERTICAL: 'vertical',
  HORIZONTAL_PRODUCT: 'horizontal_product'
}

// 横向表「菜品」占位列：打印/预览时被动态菜品列替换
const DISH_ANCHOR_TEXT = '{{列.菜品}}'

// 编辑器预览 demo 菜品列标记（erp 编辑页注入，保存时剥离还原锚点）
const DYNAMIC_DEMO_FLAG = '_dynamicDemo'

const isHorizontalProduct = content =>
  content && content.tableType === TABLE_BODY_TYPE.HORIZONTAL_PRODUCT

// 切换到横向表时剔除非白名单列；空文本列（自定义/签字）与 demo 菜品列保留
// （demo 列代表动态菜品列——否则「横向→纵向→横向」往返会把锚点连带清除，保存后丢失菜品列）
const filterHorizontalColumns = (columns, keepTexts) =>
  (columns || []).filter(
    c => !c.text || c[DYNAMIC_DEMO_FLAG] || keepTexts.includes(c.text)
  )

// 横向表保障：无菜品锚点且无 demo 列时补插锚点列（否则该表体无动态菜品列可用）
const ensureDishAnchor = columns => {
  const list = columns || []
  const hasAnchor = list.some(
    c => c.text === DISH_ANCHOR_TEXT || c[DYNAMIC_DEMO_FLAG]
  )
  if (hasAnchor) return list
  return [
    ...list,
    {
      head: '菜品',
      headStyle: { textAlign: 'center' },
      style: { textAlign: 'center' },
      text: DISH_ANCHOR_TEXT
    }
  ]
}

module.exports = {
  TABLE_BODY_TYPE,
  DISH_ANCHOR_TEXT,
  DYNAMIC_DEMO_FLAG,
  isHorizontalProduct,
  filterHorizontalColumns,
  ensureDishAnchor
}
