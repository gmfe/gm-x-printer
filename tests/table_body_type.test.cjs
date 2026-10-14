// tests/table_body_type.test.cjs
const test = require('node:test')
const assert = require('node:assert/strict')
const {
  TABLE_BODY_TYPE,
  DISH_ANCHOR_TEXT,
  DYNAMIC_DEMO_FLAG,
  isHorizontalProduct,
  filterHorizontalColumns,
  ensureDishAnchor
} = require('../src/common/table_body_type')

const col = text => ({ head: text, text, headStyle: {}, style: {} })

test('constants', () => {
  assert.equal(TABLE_BODY_TYPE.VERTICAL, 'vertical')
  assert.equal(TABLE_BODY_TYPE.HORIZONTAL_PRODUCT, 'horizontal_product')
  assert.equal(DISH_ANCHOR_TEXT, '{{列.菜品}}')
})

test('isHorizontalProduct: 缺省 vertical 天然兼容', () => {
  assert.equal(isHorizontalProduct({}), false)
  assert.equal(isHorizontalProduct({ tableType: 'vertical' }), false)
  assert.equal(isHorizontalProduct({ tableType: 'horizontal_product' }), true)
})

test('filterHorizontalColumns: 白名单 + 空文本列保留，其余剔除', () => {
  const columns = [
    col('{{列.班级名称}}'),
    col('{{列.生产日期}}'), // 非白名单 → 剔除
    col(''), // 自定义/签字列 → 保留
    col('{{列.菜品}}'),
    col('{{列.配送内容}}')
  ]
  const keep = filterHorizontalColumns(columns, [
    '{{列.班级名称}}',
    '{{列.菜品}}',
    '{{列.配送内容}}'
  ])
  assert.deepEqual(
    keep.map(c => c.text),
    ['{{列.班级名称}}', '', '{{列.菜品}}', '{{列.配送内容}}']
  )
})

test('filterHorizontalColumns: 不修改原数组', () => {
  const columns = [col('{{列.班级名称}}'), col('{{列.生产日期}}')]
  Object.freeze(columns)
  filterHorizontalColumns(columns, ['{{列.班级名称}}'])
  // 不抛错即通过（实现须返回新数组）
})


test('filterHorizontalColumns: demo 菜品列保留（横向→纵向→横向往返不丢菜品列）', () => {
  const demo = { head: '菜品示例A', text: '{{列.菜品示例A}}', [DYNAMIC_DEMO_FLAG]: true }
  const keep = filterHorizontalColumns(
    [{ text: '{{列.班级名称}}' }, demo, { text: '{{列.生产日期}}' }],
    ['{{列.班级名称}}']
  )
  assert.deepEqual(
    keep.map(c => c.text),
    ['{{列.班级名称}}', '{{列.菜品示例A}}']
  )
})

test('ensureDishAnchor: 无锚点无 demo 时补插，已有则原样', () => {
  const withAnchor = [{ text: DISH_ANCHOR_TEXT }]
  assert.equal(ensureDishAnchor(withAnchor), withAnchor)
  const withDemo = [{ [DYNAMIC_DEMO_FLAG]: true, text: '{{列.菜品示例A}}' }]
  assert.equal(ensureDishAnchor(withDemo), withDemo)
  const patched = ensureDishAnchor([{ text: '{{列.班级名称}}' }])
  assert.equal(patched.length, 2)
  assert.equal(patched[1].text, DISH_ANCHOR_TEXT)
  assert.equal(patched[1].head, '菜品')
})
