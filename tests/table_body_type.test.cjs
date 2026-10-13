// tests/table_body_type.test.cjs
const test = require('node:test')
const assert = require('node:assert/strict')
const {
  TABLE_BODY_TYPE,
  DISH_ANCHOR_TEXT,
  isHorizontalProduct,
  filterHorizontalColumns,
  sumColumnAll
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

test('sumColumnAll: 全量求和、小数两位、非数值容错', () => {
  const rows = [{ 米饭: 3600 }, { 米饭: 4500 }, { 米饭: '-' }, { 米饭: '' }]
  assert.equal(sumColumnAll('米饭', rows), '8100')
  const decimal = [{ 肉排: 2160.5 }, { 肉排: 1080.25 }]
  assert.equal(sumColumnAll('肉排', decimal), '3240.75')
  assert.equal(sumColumnAll('不存在的列', rows), '0')
  // 容错：空列表 / null
  assert.equal(sumColumnAll('米饭', []), '0')
  assert.equal(sumColumnAll('米饭', null), '0')
})
