const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { execFileSync } = require('node:child_process')
const babel = require('@babel/core')

// Use the repository's Babel preset to exercise real MobX stores and React
// render output; Node's test runner remains the only test framework.
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
const editorStore = require('../src/editor/store').default
const Table = require('../src/printer/table').default.wrappedComponent
const PrinterStore = require('../src/printer/store').default
const { getDataKey } = require('../src/util')

const columns = [
  { head: '父名称（可改）', text: '{{列.组合商品名称}}' },
  { head: '父下单数', text: '{{列.组合商品下单数}}' },
  { head: '子商品', text: '{{列.商品名}}' }
]
const row = (key, child) => ({
  _combineGroupKey: key,
  组合商品名称: '完整父商品名称',
  组合商品下单数: '2份',
  商品名: child
})
const table = (rows, options = {}) => {
  const config = {
    dataKey: 'allprodGrouped', columns,
    ...options.config
  }
  const printerStore = {
    ready: true,
    isDeliverType: true,
    isFirstLeftThenRight: options.firstLeft || false,
    tableVerticalStyle: options.firstLeft ? 'firstLeftThenRight' : 'leftToRight',
    config: {}, tablesInfo: {}, lastTableCellCount: {},
    templateTableByDelivery: (text, data) => text.replace(/{{列\.([^}]+)}}/g, (_, key) => data[key] || ''),
    ...options.store
  }
  printerStore.data = { _table: { [getDataKey(config.dataKey, config.arrange, printerStore.tableVerticalStyle)]: rows } }
  return new Table({
    config, printerStore, name: 'contents.table.0', pageIndex: 0,
    range: { begin: 0, end: rows.length, size: rows.length, ...options.range },
    isRenderBefore: options.isRenderBefore || false
  })
}
const renderedRows = instance => instance.renderDefault().props.children[1].props.children[0]
const cells = renderedRow => renderedRow.props.children.filter(Boolean)

test('new mode initializes parent and child columns and retains edits on repeated selection', () => {
  const config = { contents: [{ dataKey: 'orders', columns: [] }] }
  editorStore.config = config
  editorStore.mockData = { _table: { orders: [], allprodGrouped: [] } }
  editorStore.selectedRegion = 'contents.table.0'
  editorStore.setTableDataKey('allprodGrouped')
  const current = editorStore.config.contents[0]
  assert.ok(current.columns.some(column => column.text === '{{列.组合商品名称}}'))
  assert.ok(current.columns.some(column => column.text === '{{列.组合商品下单数}}'))
  assert.ok(current.columns.some(column => column.text === '{{列.商品名}}'))
  current.columns[0].head = '编辑后的标题'
  current.columns[0].style = { fontSize: '18px' }
  current.columns.pop()
  current.dataKey = 'allprodGrouped_multi'
  const before = JSON.stringify(current)
  editorStore.setTableDataKey('allprodGrouped')
  assert.equal(JSON.stringify(current), before)
})

test('real rendering produces rowspan, omits covered tds and preserves child templates', () => {
  const rows = [row('a', '子1'), row('a', '子2'), row('a', '子3')]
  const rendered = renderedRows(table(rows))
  assert.equal(cells(rendered[0])[0].props.rowSpan, 3)
  assert.equal(cells(rendered[0])[1].props.rowSpan, 3)
  assert.equal(cells(rendered[1]).length, 1)
  assert.equal(cells(rendered[1])[0].props.dangerouslySetInnerHTML.__html, '子2')
})

test('mixed bracket child formulas preserve child values and pure bracket parents still print', () => {
  const store = new PrinterStore()
  store.data = { common: {} }
  const rendered = renderedRows(table([row('a', '子1'), row('a', '子2')], {
    config: { columns: [
      { head: '混合公式', text: '{{列.组合商品名称}} {{列["商品名"]}}' },
      { head: '括号父名称', text: '{{列["组合商品名称"]}}' }
    ] },
    store: { templateTableByDelivery: store.templateTableByDelivery.bind(store) }
  }))
  assert.equal(cells(rendered[1]).length, 2)
  assert.equal(cells(rendered[1])[0].props.dangerouslySetInnerHTML.__html, '完整父商品名称 子2')
  assert.equal(cells(rendered[1])[1].props.dangerouslySetInnerHTML.__html, '完整父商品名称')
  assert.equal(cells(rendered[0])[0].props.rowSpan, undefined)
})

test('page continuation renders complete parent contents on its first visible child', () => {
  const rendered = renderedRows(table([row('a', '子1'), row('a', '子2'), row('a', '子3')], {
    range: { begin: 1, end: 3, size: 2 }
  }))
  assert.equal(cells(rendered[0])[0].props.rowSpan, 2)
  assert.equal(cells(rendered[0])[0].props.dangerouslySetInnerHTML.__html, '完整父商品名称')
  assert.equal(cells(rendered[0])[1].props.dangerouslySetInnerHTML.__html, '2份')
})

test('first-left-then-right maps page-local right rows before independently merging', () => {
  const rendered = renderedRows(table([
    row('a', '子1'), row('a', '子2'), row('b', '子3'), row('b', '子4')
  ], {
    config: { dataKey: 'allprodGrouped_multi', arrange: 'vertical' },
    firstLeft: true, range: { end: 4, size: 2 }
  }))
  assert.equal(rendered.length, 2)
  assert.equal(cells(rendered[0])[0].props.rowSpan, 2)
  assert.equal(cells(rendered[0])[3].props.rowSpan, 2)
  assert.equal(cells(rendered[0])[5].props.dangerouslySetInnerHTML.__html, '子3')
  assert.equal(cells(rendered[1]).length, 2)
})

test('measurement renders every original first-left-then-right row without merging', () => {
  const rendered = renderedRows(table([
    row('a', '子1'), row('a', '子2'), row('b', '子3'), row('b', '子4')
  ], {
    config: { dataKey: 'allprodGrouped_multi', arrange: 'vertical' },
    firstLeft: true, range: { end: 4, size: 2 }, isRenderBefore: true,
    store: { ready: false }
  }))
  assert.equal(rendered.length, 4)
  assert.ok(rendered.every(renderedRow => cells(renderedRow).length === 6))
  assert.ok(rendered.every(renderedRow => !cells(renderedRow)[0].props.rowSpan))
  assert.equal(cells(rendered[3])[5].props.dangerouslySetInnerHTML.__html, '子4')
})

test('legacy allprod rows remain independent', () => {
  const rendered = renderedRows(table([row('a', '子1'), row('a', '子2')], { config: { dataKey: 'allprod' } }))
  assert.equal(cells(rendered[1]).length, 3)
  assert.equal(cells(rendered[0])[0].props.rowSpan, undefined)
})

const paginate = (tables, options = {}) => {
  const store = new PrinterStore()
  store.init({
    isDeliverType: true, tableVerticalStyle: 'firstLeftThenRight',
    contents: tables.map(({ dataKey }, index) => ({
      type: 'table', dataKey: dataKey || `allprodGrouped${index ? '' : '_multi'}`,
      arrange: 'vertical', columns,
      subtotal: { show: false }, summaryConfig: {}, allOrderSummaryConfig: {}
    })),
    ...options.config
  }, { _table: Object.fromEntries(tables.map(({ rows, dataKey }, index) => [
    getDataKey(dataKey || `allprodGrouped${index ? '' : '_multi'}`, 'vertical', 'firstLeftThenRight'), rows
  ])) })
  store.setHeight('header', options.headerHeight || 0)
  store.setHeight('footer', options.footerHeight || 0)
  store.setHeight('sign', 0)
  store.setPageHeight(options.pageHeight || 190)
  tables.forEach(({ heights }, index) => store.setTable(`contents.table.${index}`, {
    head: { height: 23, widths: [] }, body: { heights, children: [] }
  }))
  store.setAutofillConfig(options.filling || false)
  store.computedPages()
  return store
}

test('pagination reserves long resumed parent height in the page-local right lane', () => {
  const rows = Array.from({ length: 8 }, (_, i) => row('a', `子${i}`))
  const store = paginate([{ rows, heights: [23, 23, 23, 72, 23, 23, 23, 23] }])
  const ranges = Array.from(store.pages).flatMap(page => Array.from(page))
  assert.equal(ranges.length, 2)
  assert.deepEqual(ranges.map(range => [range.begin, range.size]), [[0, 2], [4, 2]])
  for (const range of ranges) {
    assert.ok(range.size * 72 + 23 <= 190)
    const rendered = renderedRows(table(rows, {
      config: { dataKey: 'allprodGrouped_multi', arrange: 'vertical' },
      firstLeft: true, range
    }))
    assert.equal(cells(rendered[0])[0].props.dangerouslySetInnerHTML.__html, '完整父商品名称')
    assert.equal(cells(rendered[0])[3].props.dangerouslySetInnerHTML.__html, '完整父商品名称')
  }
})

test('lines-per-page with filling counts visible rows and never merges empty right cells', () => {
  const rows = Array.from({ length: 5 }, (_, i) => row('a', `子${i}`))
  const store = paginate([{ rows, heights: rows.map(() => 23) }], {
    config: { linesPerPage: 2 }, filling: 'empty'
  })
  const ranges = Array.from(store.pages).flatMap(page => Array.from(page))
  assert.deepEqual(ranges.map(range => [range.begin, range.size]), [[0, 2], [4, 2]])
  const rendered = renderedRows(table(rows, {
    config: { dataKey: 'allprodGrouped_multi', arrange: 'vertical' },
    firstLeft: true, range: ranges[1], store: { isAutoFilling: 'empty' }
  }))
  assert.equal(rendered.length, 2)
  assert.equal(cells(rendered[0])[3].props.rowSpan, undefined)
  assert.equal(cells(rendered[1]).length, 6)
})

test('multiple tables preserve distinct page ranges without sharing group merge state', () => {
  const firstRows = Array.from({ length: 4 }, (_, i) => row('same-key', `前表${i}`))
  const secondRows = Array.from({ length: 3 }, (_, i) => row('same-key', `后表${i}`))
  const store = paginate([
    { rows: firstRows, heights: firstRows.map(() => 40) },
    { rows: secondRows, heights: secondRows.map(() => 40) }
  ], { config: { linesPerPage: 2 } })
  const ranges = Array.from(store.pages).flatMap(page => Array.from(page))
  assert.ok(ranges.some(range => range.index === 0))
  assert.ok(ranges.some(range => range.index === 1))
  const secondRanges = ranges.filter(range => range.index === 1)
  assert.equal(secondRanges[0].begin, 0)
  assert.equal(secondRanges[secondRanges.length - 1].end, 3)
  assert.deepEqual(firstRows.map(item => item.商品名), ['前表0', '前表1', '前表2', '前表3'])
  assert.deepEqual(secondRows.map(item => item.商品名), ['后表0', '后表1', '后表2'])
})

test('page header/footer exceeding a small sheet reports a grouped-data error, preserving empty and legacy behavior', () => {
  const rows = [row('a', '子1'), row('a', '子2')]
  const store = paginate([{ dataKey: 'allprodGrouped', rows, heights: [23, 23] }], {
    pageHeight: 50, headerHeight: 40, footerHeight: 20
  })
  assert.match(store.paginationError, /页眉.*页脚.*纸张/)
  assert.match(store.paginationError, /增大|减小/)
  assert.equal(store.pages.length, 0)
  assert.deepEqual(rows.map(item => item.商品名), ['子1', '子2'])
  for (const fixture of [
    { dataKey: 'allprodGrouped', rows: [], heights: [] },
    { dataKey: 'orders', rows, heights: [23, 23] }
  ]) {
    const compatible = paginate([fixture], { pageHeight: 50, headerHeight: 60 })
    assert.equal(compatible.paginationError, '')
  }
})

test('an oversized preceding content region cannot silently skip a grouped table', () => {
  const rows = [row('a', '子1')]
  const store = paginate([{ dataKey: 'allprodGrouped', rows, heights: [23] }], { pageHeight: 50 })
  store.config.contents.unshift({ type: 'text', blocks: [] })
  store.setHeight('contents.panel.0', 80)
  store.setTable('contents.table.1', store.tablesInfo['contents.table.0'])
  store.computedPages()
  assert.match(store.paginationError, /内容区域.*纸张/)
  assert.equal(store.pages.length, 0)
  assert.equal(rows[0].商品名, '子1')
})

const overflowCase = (name, verify) => test(name, () => {
  // A synchronous pagination loop cannot be interrupted by node:test's timer.
  // Isolate regression cases so a broken paginator fails instead of hanging CI.
  if (!process.env.GROUPED_OVERFLOW_CASE) {
    const childEnvironment = { ...process.env, GROUPED_OVERFLOW_CASE: name }
    delete childEnvironment.NODE_TEST_CONTEXT
    execFileSync(process.execPath, ['--test', __filename], {
      env: childEnvironment, timeout: 6000,
      stdio: 'pipe'
    })
  } else if (process.env.GROUPED_OVERFLOW_CASE === name) {
    verify()
  }
})

overflowCase('oversized grouped row stops with an actionable error and preserves all source rows', () => {
  const rows = [row('a', '子1'), row('a', '子2')]
  const store = paginate([{ dataKey: 'allprodGrouped', rows, heights: [240, 23] }])
  assert.match(store.paginationError, /页面.*高度/)
  assert.match(store.paginationError, /纸张|列宽/)
  assert.equal(store.pages.length, 0)
  assert.deepEqual(rows.map(item => item.商品名), ['子1', '子2'])
})

overflowCase('first-left oversized row and too-small sheets terminate without incomplete print pages', () => {
  for (const fixture of [
    { heights: [240, 23, 23], pageHeight: 190 },
    { heights: [23, 23, 23], pageHeight: 30 }
  ]) {
    const rows = [row('a', '子1'), row('a', '子2'), row('a', '子3')]
    const store = paginate([{ rows, heights: fixture.heights }], { pageHeight: fixture.pageHeight })
    assert.ok(store.paginationError)
    assert.equal(store.pages.length, 0)
    assert.equal(rows.length, 3)
  }
})

overflowCase('grouped table following a legacy table moves to a fresh page when its first row fits there', () => {
  const first = [row(undefined, '旧1'), row(undefined, '旧2')]
  const second = [row('a', '新1'), row('a', '新2')]
  const store = paginate([
    { dataKey: 'orders', rows: first, heights: [40, 40] },
    { dataKey: 'allprodGrouped', rows: second, heights: [100, 23] }
  ])
  const ranges = Array.from(store.pages).flatMap(page => Array.from(page))
  assert.equal(store.paginationError, '')
  assert.deepEqual(ranges.map(range => [range.index, range.begin, range.end]), [[0, 0, 2], [1, 0, 2]])
  assert.equal(store.pages.length, 2)
  assert.deepEqual(second.map(item => item.商品名), ['新1', '新2'])
})
