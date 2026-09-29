const test = require('node:test')
const assert = require('node:assert/strict')
const { getGroupedDeliveryRowSpans } = require('../src/printer/grouped_delivery')

const NAME = '{{列.组合商品名称}}'
const COUNT = '{{列.组合商品下单数}}'
const SUFFIX = '_MULTI_SUFFIX'
const row = (key, name = '套餐') => ({
  _combineGroupKey: key,
  组合商品名称: name,
  组合商品下单数: '2份',
  商品名: '子商品'
})
const spans = (rows, lane = 0, text = NAME, mode = 'allprodGrouped') =>
  getGroupedDeliveryRowSpans(rows, lane, text, mode)

test('three children share one parent cell without mutating source rows', () => {
  const rows = [row('a'), row('a'), row('a')].map(Object.freeze)
  assert.deepEqual(spans(Object.freeze(rows)), [3, 0, 0])
  assert.deepEqual(spans(rows, 0, COUNT), [3, 0, 0])
  assert.equal(rows[1].组合商品名称, '套餐')
})

test('same parent name with distinct identities does not merge', () => {
  assert.deepEqual(spans([row('a'), row('b'), row('b')]), [1, 2, 0])
})

test('each continuation page starts a complete independent parent cell', () => {
  const rows = Array.from({ length: 5 }, () => row('a'))
  assert.deepEqual(spans(rows.slice(0, 3)), [3, 0, 0])
  assert.deepEqual(spans(rows.slice(3)), [2, 0])
  assert.equal(rows[3].组合商品下单数, '2份')
})

test('left and right lanes merge independently, including same group across lanes', () => {
  const rows = [row('a'), row('a'), row('b')].map((left, index) => ({
    ...left,
    ['_combineGroupKey' + SUFFIX]: index === 0 ? 'b' : 'a'
  }))
  assert.deepEqual(spans(rows), [2, 0, 1])
  assert.deepEqual(spans(rows, 1, '{{列.组合商品名称_MULTI_SUFFIX}}'), [1, 2, 0])
})

test('empty right lane never borrows the left identity', () => {
  assert.deepEqual(
    spans([row('a'), row('a')], 1, '{{列.组合商品名称_MULTI_SUFFIX}}'),
    [1, 1]
  )
})

test('ordinary, filling and special rows stop a contiguous parent segment', () => {
  assert.deepEqual(
    spans([row('a'), {}, row('a'), { ...row('a'), _isEmptyData: true }, row('a')]),
    [1, 1, 1, 1, 1]
  )
  assert.deepEqual(spans([row('a'), { ...row('a'), _special: {} }, row('a')]), [1, 1, 1])
})

test('parent-only formulas merge; custom headers do not determine identity', () => {
  const customColumn = { head: '客户改过的列名', text: '{{removeTrailingZeros(列.组合商品下单数)}}' }
  assert.deepEqual(spans([row('a'), row('a')], 0, customColumn.text), [2, 0])
  assert.deepEqual(spans([row('a'), row('a')], 0, '{{列.组合商品名称}} {{列.商品名}}'), [1, 1])
  assert.deepEqual(spans([row('a'), row('a')], 0, '{{列.商品名}}'), [1, 1])
  assert.deepEqual(spans([row('a'), row('a')], 0, '组合商品名称'), [1, 1])
})

test('unrecognized row access conservatively retains every child cell', () => {
  const rows = [row('a'), row('a')]
  for (const text of [
    '{{列.组合商品名称}} {{列["商品名"]}}',
    "{{列.组合商品名称 + 列['商品名']}}",
    '{{列["组合商品名称"]}}',
    '{{列.组合商品名称 + 列[字段名]}}',
    '{{列.组合商品名称 + 列?.商品名}}',
    '{{列?.组合商品名称}}',
    '{{列.组合商品名称 + 列 . 商品名}}',
    '{{列 . 组合商品名称}}',
    '{{列.组合商品名称 + 列 [ "商品名" ]}}',
    '{{列.组合商品名称 + ((item) => item.商品名)(列)}}'
  ]) {
    assert.deepEqual(spans(rows, 0, text), [1, 1], text)
  }
})

test('one child, missing identities and zero identity remain valid', () => {
  assert.deepEqual(spans([row('a')]), [1])
  assert.deepEqual(spans([row(undefined), row(undefined)]), [1, 1])
  assert.deepEqual(spans([row(0), row(0)]), [2, 0])
})

test('legacy modes never merge; new multi variants use the same protocol', () => {
  const rows = [row('a'), row('a')]
  for (const mode of ['allprod', 'allprod_multi', 'orders', 'combination']) {
    assert.deepEqual(spans(rows, 0, NAME, mode), [1, 1])
  }
  for (const mode of ['allprodGrouped', 'allprodGrouped_multi', 'allprodGrouped_multi_vertical', 'allprodGrouped_multi_vertical_firstLeftThenRight']) {
    assert.deepEqual(spans(rows, 0, NAME, mode), [2, 0])
  }
})
