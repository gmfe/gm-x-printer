const test = require('node:test')
const assert = require('node:assert/strict')
const {
  getGroupedDeliveryRowSpans,
  getGroupedMergeFields,
  DEFAULT_PARENT_FIELDS
} = require('../src/printer/grouped_delivery')

const NAME = '{{列.组合商品名称}}'
const COUNT = '{{列.组合商品下单数}}'
const SUFFIX = '_MULTI_SUFFIX'
const row = (key, name = '套餐') => ({
  _combineGroupKey: key,
  组合商品名称: name,
  组合商品下单数: '2',
  商品名: '子商品'
})
const spans = (rows, lane = 0, text = NAME, mode = 'allprodGrouped') =>
  getGroupedDeliveryRowSpans(rows, lane, text, mode)

test('three children share one parent name cell; order count renders per row', () => {
  const rows = [row('a'), row('a'), row('a')].map(Object.freeze)
  assert.deepEqual(spans(Object.freeze(rows)), [3, 0, 0])
  // 2026-10-10 补充：组合商品下单数不再跨行合并
  assert.deepEqual(spans(rows, 0, COUNT), [1, 1, 1])
  assert.equal(rows[1].组合商品名称, '套餐')
})

test('same parent name with distinct identities does not merge', () => {
  assert.deepEqual(spans([row('a'), row('b'), row('b')]), [1, 2, 0])
})

test('each continuation page starts a complete independent parent cell', () => {
  const rows = Array.from({ length: 5 }, () => row('a'))
  assert.deepEqual(spans(rows.slice(0, 3)), [3, 0, 0])
  assert.deepEqual(spans(rows.slice(3)), [2, 0])
  assert.equal(rows[3].组合商品下单数, '2')
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
  const customColumn = { head: '客户改过的列名', text: '{{removeTrailingZeros(列.组合商品名称)}}' }
  assert.deepEqual(spans([row('a'), row('a')], 0, customColumn.text), [2, 0])
  // 下单数已退出父字段，仅含下单数的公式逐行渲染
  assert.deepEqual(spans([row('a'), row('a')], 0, '{{removeTrailingZeros(列.组合商品下单数)}}'), [1, 1])
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

test('merge field list is config-driven; count merges again when configured', () => {
  const rows = [row('a'), row('a'), row('a')]
  // 默认名单：下单数逐行
  assert.deepEqual(spans(rows, 0, COUNT), [1, 1, 1])
  // 调用方（表 config）指定名单：下单数恢复合并——无需改打印库
  assert.deepEqual(
    getGroupedDeliveryRowSpans(rows, 0, COUNT, 'allprodGrouped', '_MULTI_SUFFIX', ['组合商品下单数']),
    [3, 0, 0]
  )
  assert.deepEqual(
    getGroupedDeliveryRowSpans(rows, 0, COUNT, 'allprodGrouped', '_MULTI_SUFFIX', ['组合商品名称', '组合商品下单数']),
    [3, 0, 0]
  )
  // 名单里没有名称时名称列也不再合并
  assert.deepEqual(
    getGroupedDeliveryRowSpans(rows, 0, NAME, 'allprodGrouped', '_MULTI_SUFFIX', ['组合商品下单数']),
    [1, 1, 1]
  )
})

test('getGroupedMergeFields falls back to defaults on missing or invalid config', () => {
  assert.equal(getGroupedMergeFields(undefined), DEFAULT_PARENT_FIELDS)
  assert.equal(getGroupedMergeFields({}), DEFAULT_PARENT_FIELDS)
  assert.equal(getGroupedMergeFields({ mergeFields: [] }), DEFAULT_PARENT_FIELDS)
  assert.equal(getGroupedMergeFields({ mergeFields: '组合商品名称' }), DEFAULT_PARENT_FIELDS)
  assert.equal(getGroupedMergeFields({ mergeFields: [1, null] }), DEFAULT_PARENT_FIELDS)
  assert.deepEqual(getGroupedMergeFields({ mergeFields: ['组合商品名称', '组合商品下单数'] }), [
    '组合商品名称',
    '组合商品下单数'
  ])
  assert.deepEqual(getGroupedMergeFields({ mergeFields: ['自定义父字段', 42] }), ['自定义父字段'])
})
