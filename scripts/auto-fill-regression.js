#!/usr/bin/env node
// 自动填充行数回归检查（TAPD 1158798739001093058 / 1158798739001093059）
// 覆盖 printer/store.js 的 changeTableData / clearAllExtraTableData：
// 1. 配送单（isDeliverType）路径：changeTableData 不追加行、数据内容不变
// 2. 非配送单路径：重复调用幂等，不再叠加追加空白行
// 3. clearAllExtraTableData：清理残留空行；对无标记数据 no-op；对双栏数组行安全

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const repoRoot = path.resolve(__dirname, '..')
const buildRoot = path.join(repoRoot, '.tmp-autofill-build')
const babelBin = path.join(repoRoot, 'node_modules', '.bin', 'babel')

function buildTestModules() {
  fs.rmSync(buildRoot, { recursive: true, force: true })
  fs.mkdirSync(buildRoot, { recursive: true })

  execFileSync(
    babelBin,
    [
      'src',
      '--out-dir',
      path.join(buildRoot, 'src'),
      '--copy-files',
      '--plugins',
      '@babel/plugin-transform-modules-commonjs'
    ],
    {
      cwd: repoRoot,
      stdio: 'ignore'
    }
  )

  execFileSync(
    babelBin,
    [
      'locales',
      '--out-dir',
      path.join(buildRoot, 'locales'),
      '--copy-files',
      '--plugins',
      '@babel/plugin-transform-modules-commonjs'
    ],
    {
      cwd: repoRoot,
      stdio: 'ignore'
    }
  )
}

function run() {
  buildTestModules()

  const PrinterStore = require(path.join(
    buildRoot,
    'src',
    'printer',
    'store.js'
  )).default

  const baseConfig = {
    batchPrintConfig: 1,
    contents: [
      {
        type: 'table',
        dataKey: 'orders',
        columns: [{ head: '商品', text: '{{列.商品}}' }]
      }
    ],
    autoFillConfig: {
      region: 'contents.table.0',
      dataKey: 'orders',
      checked: true
    }
  }

  // ---------- 场景 1：配送单（isDeliverType）路径 ----------
  // changeTableData 不往 data 追加行，真实数据内容保持不变
  {
    const store = new PrinterStore()
    const realRows = [{ 商品: 'a' }, { 商品: 'b' }]
    const data = { _table: { orders: realRows.slice() } }
    store.init({ ...baseConfig, isDeliverType: true }, data)
    store.setAutofillConfig(true)
    store.remainPageHeight = 100
    store.changeTableData()
    assert.strictEqual(
      data._table.orders.length,
      2,
      '[deliver] changeTableData 不应追加任何行'
    )
    assert.deepStrictEqual(
      data._table.orders,
      realRows,
      '[deliver] 数据内容应保持不变'
    )
  }

  // ---------- 场景 2：非配送单路径幂等 ----------
  // 重复调用（模拟重挂载）不再叠加追加空白行
  {
    const store = new PrinterStore()
    const data = { _table: { orders: [{ 商品: 'a' }, { 商品: 'b' }] } }
    // customerRowHeight=10 + remainPageHeight=30 => 追加 3 行空白
    store.init(
      {
        ...baseConfig,
        contents: [{ ...baseConfig.contents[0], customerRowHeight: 10 }]
      },
      data
    )
    store.setAutofillConfig(true)
    store.remainPageHeight = 30

    store.changeTableData()
    const lenAfterFirst = data._table.orders.length
    assert.ok(lenAfterFirst > 2, '[non-deliver] 开启填充应追加空白行')
    assert.ok(
      data._table.orders.slice(2).every(r => r._isEmptyData),
      '[non-deliver] 追加的行应带 _isEmptyData 标记'
    )

    store.changeTableData()
    store.changeTableData()
    assert.strictEqual(
      data._table.orders.length,
      lenAfterFirst,
      '[non-deliver] 重复调用不应叠加追加（幂等）'
    )
    assert.strictEqual(
      data._table.orders.filter(r => !r._isEmptyData).length,
      2,
      '[non-deliver] 真实数据行不应丢失'
    )
  }

  // ---------- 场景 3：clearAllExtraTableData ----------
  {
    const store = new PrinterStore()
    const data = {
      _table: {
        orders: [{ 商品: 'a' }, { _isEmptyData: true, 商品: '' }],
        // 双栏配送数据：行元素是数组，不应被误删
        orders_multi: [[{ 商品: 'a' }], [{ 商品: 'b' }]],
        clean: [{ 商品: 'x' }]
      }
    }
    store.init({ ...baseConfig, isDeliverType: true }, data)
    store.clearAllExtraTableData()
    assert.deepStrictEqual(
      data._table.orders,
      [{ 商品: 'a' }],
      '应剔除 _isEmptyData 空白行'
    )
    assert.deepStrictEqual(
      data._table.orders_multi,
      [[{ 商品: 'a' }], [{ 商品: 'b' }]],
      '双栏数组行（配送单）不应被误删'
    )
    assert.deepStrictEqual(
      data._table.clean,
      [{ 商品: 'x' }],
      '无标记数据应保持不变'
    )

    // data._table 缺失时不抛错
    const store2 = new PrinterStore()
    store2.init({ ...baseConfig }, { _table: undefined })
    store2.clearAllExtraTableData()
  }

  // ---------- 场景 4：changeTableData 对缺失 dataKey 不抛错 ----------
  {
    const store = new PrinterStore()
    const data = { _table: {} }
    store.init({ ...baseConfig }, data)
    store.setAutofillConfig(true)
    store.changeTableData()
    // 不抛错且不得写入 undefined 键（|| [] 兜底断言对 falsy 恒真，锁不住回归）
    assert.ok(
      !Object.prototype.hasOwnProperty.call(data._table, undefined),
      '缺失 dataKey 不应写入 _table[undefined]'
    )
  }

  console.log('auto-fill regression checks passed')
}

run()
