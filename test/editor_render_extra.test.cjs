const assert = require('node:assert/strict')
const { test } = require('node:test')
const path = require('node:path')
const { transformFileSync } = require('@babel/core')

// Only this isolated test process uses Babel/asset require hooks for webpack source.
/* eslint-disable node/no-deprecated-api */
// Reuse the repository's Babel preset; Node's test runner needs CommonJS.
const root = path.resolve(__dirname, '..')
const Module = require('node:module')
const resolveFilename = Module._resolveFilename
Module._resolveFilename = function(request, ...args) {
  return resolveFilename.call(
    this,
    request.includes('!') ? request.split('!').pop() : request,
    ...args
  )
}
const loadJavaScript = require.extensions['.js']
require.extensions['.js'] = (module, filename) => {
  if (
    filename.startsWith(path.join(root, 'src') + path.sep) ||
    filename.startsWith(path.join(root, 'locales') + path.sep) ||
    filename.startsWith(path.join(root, 'node_modules/gm-util') + path.sep)
  ) {
    const { code } = transformFileSync(filename, {
      configFile: path.join(root, 'babel.config.js'),
      plugins: ['@babel/plugin-transform-modules-commonjs']
    })
    module._compile(code, filename)
  } else {
    loadJavaScript(module, filename)
  }
}
for (const extension of ['.less', '.css', '.png', '.jpg', '.svg']) {
  require.extensions[extension] = module => {
    module.exports = ''
  }
}
/* eslint-enable node/no-deprecated-api */

const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
require('react-dom')
require('mobx-react').useStaticRendering(true)
// The utility package reads the user agent at import time; SSR never needs a DOM.
global.window = { navigator: { userAgent: '' } }
// Browser printing creates DOM nodes at import time. These editor tests never print.
const printPath = path.join(root, 'src/printer/do_print.js')
require.cache[printPath] = {
  id: printPath,
  filename: printPath,
  loaded: true,
  exports: {}
}
const EditorField = require('../src/common/editor_edit_field').default
const EditorStore = require('../src/common/editor_store').default
const SortingEditor = require('../src/editor_sorting/editor').default

function createConfig() {
  return {
    page: {
      type: 'A4',
      printDirection: 'vertical',
      size: { width: '210mm', height: '297mm' },
      style: {},
      gap: {
        paddingTop: '5mm',
        paddingRight: '5mm',
        paddingBottom: '5mm',
        paddingLeft: '5mm'
      }
    },
    header: { style: {}, blocks: [] },
    footer: { style: {}, blocks: [] },
    sign: { style: {}, blocks: [] },
    contents: [
      {
        type: 'table',
        dataKey: 'sorting_detail',
        style: {},
        columns: [
          { head: '货位', text: '{{列.现存货位}}', style: {}, headStyle: {} }
        ],
        specialConfig: { template_text: '', style: {} },
        subtotal: { show: false }
      }
    ]
  }
}

function createStore() {
  const store = new EditorStore()
  store.init(createConfig(), { common: {}, _table: {} })
  store.setSelectedRegion('contents.table.0')
  return store
}

function renderField(store, renderExtra) {
  return renderToStaticMarkup(
    React.createElement(EditorField, { editStore: store, renderExtra })
  )
}

test('a selected column exposes its text and a bound setter that updates the saved layout', () => {
  const store = createStore()
  store.setSelected('contents.table.0.column.0')
  let context
  const renderExtra = value => {
    context = value
    return React.createElement(
      'span',
      null,
      value ? value.selectedColumn.text : 'missing context'
    )
  }
  assert.match(renderField(store, renderExtra), /现存货位/)
  assert.equal(context && context.isTableColumnSelected, true)
  assert.deepEqual(Object.keys(context).sort(), [
    'isTableColumnSelected',
    'selectedColumn',
    'setSelectedColumnValue'
  ])
  const setValue = context.setSelectedColumnValue
  setValue('text', '{{列.现存货位_同一行}}')
  assert.equal(
    JSON.parse(JSON.stringify(store.config)).contents[0].columns[0].text,
    '{{列.现存货位_同一行}}'
  )
  assert.match(renderField(store, renderExtra), /现存货位_同一行/)
})

test('selecting only the table exposes no column and the setter cannot change a column', () => {
  const store = createStore()
  let context
  const markup = renderField(store, value => {
    context = value
    return React.createElement(
      'span',
      null,
      value && value.isTableColumnSelected ? 'column mode' : 'table mode'
    )
  })
  assert.match(markup, /table mode/)
  assert.equal(context && context.isTableColumnSelected, false)
  assert.equal(context.selectedColumn, undefined)
  context.setSelectedColumnValue('text', 'should not be saved')
  assert.equal(store.config.contents[0].columns[0].text, '{{列.现存货位}}')
})

test('omitting the callback retains the existing field editor output', () => {
  const store = createStore()
  store.setSelected('contents.table.0.column.0')
  const previous = renderField(store)
  assert.match(previous, /编辑字段/)
  assert.equal(
    renderField(store, () => null),
    previous
  )
})

test('legacy callbacks that take no argument retain their rendered content', () => {
  assert.match(
    renderField(createStore(), () =>
      React.createElement('span', null, 'legacy extra')
    ),
    /legacy extra/
  )
})

test('the sorting editor forwards the callback to the real selected-column editor', () => {
  const editor = new SortingEditor({
    config: createConfig(),
    mockData: { common: {}, _table: {} },
    showEditor: true,
    addFields: {
      commonFields: {},
      tableFields: {},
      detailFields: [],
      customerDetailFields: []
    },
    onSave: () => {},
    renderExtra: value =>
      React.createElement(
        'span',
        null,
        value && value.isTableColumnSelected
          ? 'sorting column extension'
          : 'no selected column'
      )
  })
  editor.store.setSelectedRegion('contents.table.0')
  editor.store.setSelected('contents.table.0.column.0')
  assert.match(
    renderToStaticMarkup(editor.render()),
    /sorting column extension/
  )
})
