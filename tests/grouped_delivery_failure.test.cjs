const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const Module = require('node:module')
const babel = require('@babel/core')
const ReactDOM = require('react-dom')
const root = path.resolve(__dirname, '..')
const originalLoader = require.extensions['.js']
require.extensions['.js'] = (module, filename) => {
  if (filename.startsWith(root + '/src/') || filename.startsWith(root + '/locales/')) {
    const { code } = babel.transformFileSync(filename, {
      cwd: root, plugins: ['@babel/plugin-transform-modules-commonjs']
    })
    module._compile(code, filename)
  } else originalLoader(module, filename)
}
require.extensions['.png'] = module => { module.exports = '' }
require.extensions['.svg'] = module => { module.exports = () => null }
const originalLoad = Module._load
Module._load = function (request, parent, isMain) {
  if (request.startsWith('!!raw-loader!')) return ''
  if (request === 'gm-util') return { isZoom2: () => false }
  return originalLoad.call(this, request, parent, isMain)
}
const app = { appendChild() {} }
global.document = {
  getElementById: () => app,
  createElement: () => ({ appendChild() {} }),
  createTextNode: text => text,
  head: app, body: app
}
let printCalls = 0
global.window = {
  document: global.document, Promise,
  print: () => { printCalls++ }
}
let rendered
ReactDOM.unmountComponentAtNode = () => {}
ReactDOM.render = element => { rendered = element }
const WithStorePrinter = require('../src/printer/printer').default
const BatchPrinter = require('../src/printer/batch_printer').default
const { doPrint, doBatchPrint, renderBatchPrintToDom } = require('../src/printer/do_print')

test('a failed batch reports the error and never reports successful completion', () => {
  let reported
  let successes = 0
  const batch = new BatchPrinter({ list: [{}, {}], onReady: () => { successes++ }, onError: error => { reported = error } })
  const printers = batch.render()
  const error = new Error('单行内容超过页面高度')
  printers[0].props.onError(error)
  printers[1].props.onReady()
  assert.equal(reported, error)
  assert.equal(successes, 0)
})

test('printer displays the actionable failure and calls onError instead of onReady', () => {
  const outer = new WithStorePrinter({ config: {}, data: {} })
  const InnerPrinter = outer.render().props.children.type.wrappedComponent
  const store = outer.printerStore
  store.config = { contents: [], page: { size: {} } }
  store.paginationError = '组合商品单行内容超过页面可打印高度，请加宽列宽。'
  let reported
  let successes = 0
  const instance = Object.create(InnerPrinter.prototype)
  instance.props = {
    config: store.config, printerStore: store,
    onReady: () => { successes++ }, onError: error => { reported = error }
  }
  instance.setState = (_, callback) => callback()
  store.computedPages = () => {}
  instance.componentDidMount()
  const alert = instance.doRender()
  assert.equal(alert.props.role, 'alert')
  assert.equal(alert.props.children, store.paginationError)
  assert.equal(reported.message, store.paginationError)
  assert.equal(successes, 0)
})

test('oversized page header flows from the real store to printer failure without successful readiness', () => {
  const outer = new WithStorePrinter({ config: {}, data: {} })
  const InnerPrinter = outer.render().props.children.type.wrappedComponent
  const store = outer.printerStore
  const config = { contents: [{ type: 'table', dataKey: 'allprodGrouped' }], isDeliverType: true }
  const rows = [{ _combineGroupKey: 'a', 商品名: '子1' }]
  store.init(config, { _table: { allprodGrouped: rows } })
  store.tableReady = {}
  store.setHeight('header', 40)
  store.setHeight('footer', 20)
  store.setPageHeight(50)
  let failure
  let successes = 0
  const instance = Object.create(InnerPrinter.prototype)
  instance.props = {
    config, printerStore: store,
    onReady: () => { successes++ }, onError: error => { failure = error }
  }
  instance.setState = (_, callback) => callback()
  instance.componentDidMount()
  assert.match(failure.message, /页眉.*页脚.*纸张/)
  assert.equal(successes, 0)
  assert.equal(store.pages.length, 0)
  assert.equal(rows[0].商品名, '子1')
  assert.equal(instance.doRender().props.role, 'alert')
})

test('single and batch programmatic printing reject failures without starting print', async () => {
  for (const start of [
    () => doPrint({ config: {}, data: {} }, true, { isTipZoom: false, isElectronPrint: true }),
    () => doBatchPrint([{ config: {}, data: {} }], true, { isTipZoom: false, isElectronPrint: true })
  ]) {
    const pending = start()
    const error = new Error('单行内容超过页面高度')
    assert.equal(typeof rendered.props.onError, 'function')
    rendered.props.onError(error)
    await assert.rejects(pending, failure => failure === error)
  }
  assert.equal(printCalls, 0)
})

test('DOM export forwards failure independently of successful readiness', () => {
  let failure
  const error = new Error('单行内容超过页面高度')
  renderBatchPrintToDom([{}], app, { onError: value => { failure = value } })
  rendered.props.onError(error)
  assert.equal(failure, error)
})
