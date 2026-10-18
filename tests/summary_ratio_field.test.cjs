const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const babel = require('@babel/core')

// 与 grouped_delivery_integration.test.cjs 相同的 ESM 加载钩子
const root = path.resolve(__dirname, '..')
const originalLoader = require.extensions['.js']
require.extensions['.js'] = (module, filename) => {
  if (filename.startsWith(root + '/src/') || filename.startsWith(root + '/locales/')) {
    const { code } = babel.transformFileSync(filename, {
      cwd: root, plugins: ['@babel/plugin-transform-modules-commonjs']
    })
    module._compile(code, filename)
  } else {
    originalLoader(module, filename)
  }
}
const { sumCol: pageSumCol } = require('../src/printer/page_summary')
const { sumCol: orderSumCol } = require('../src/printer/page_order_bottom_summary')

const rows = [
  { 子商品: false, 子商品配比数量: '', 下单数: '2' },
  { 子商品: true, 子商品配比数量: '1袋', 下单数: '1' },
  { 子商品: true, 子商品配比数量: '2袋', 下单数: '2' }
]

test('allprod 模式下子商品配比数量合计子行，其他字段仍跳过子行', () => {
  // 2026-10-10 补充：配比数量只在子行有值，不能被子商品跳过规则排除
  assert.equal(String(pageSumCol('子商品配比数量', rows, true)), '3')
  assert.equal(String(orderSumCol('子商品配比数量', rows, true)), '3')
  // 既有字段保持跳过子行的行为不变
  assert.equal(String(pageSumCol('下单数', rows, true)), '2')
  assert.equal(String(orderSumCol('下单数', rows, true)), '2')
})

test('非 allprod 模式所有行都参与合计', () => {
  assert.equal(String(pageSumCol('子商品配比数量', rows, false)), '3')
  assert.equal(String(pageSumCol('下单数', rows, false)), '5')
})
