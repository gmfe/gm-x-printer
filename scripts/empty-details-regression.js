#!/usr/bin/env node

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const repoRoot = path.resolve(__dirname, '..')
const buildRoot = path.join(repoRoot, '.tmp-regression-build')
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

  const { caclSingleDetailsPageHeight } = require(path.join(
    buildRoot,
    'src',
    'util.js'
  ))
  const PrinterStore = require(path.join(
    buildRoot,
    'src',
    'printer',
    'store.js'
  )).default

  assert.deepStrictEqual(
    caclSingleDetailsPageHeight([], 100),
    {
      ranges: [],
      detailsPageHeight: []
    },
    'empty details heights should not create split ranges'
  )

  assert.deepStrictEqual(
    caclSingleDetailsPageHeight([10, 20], 25),
    {
      ranges: [
        [0, 1],
        [1, 2]
      ],
      detailsPageHeight: [15, 25]
    },
    'non-empty details heights should keep existing split behavior'
  )

  const store = new PrinterStore()
  store.data = {
    _table: {
      purchase_last_col: [
        { rowId: 41, __details: [] },
        { rowId: 42, __details: [] },
        { rowId: 43, __details: [] }
      ]
    }
  }

  assert.deepStrictEqual(
    store.computedData('purchase_last_col', { body: { children: [] } }, 1, 100),
    [],
    'rows without details should not produce split page heights'
  )
  assert.deepStrictEqual(
    store.data._table.purchase_last_col.map(item => item.rowId),
    [41, 42, 43],
    'rows without details should not be duplicated'
  )

  const storeWithoutMeasuredHeights = new PrinterStore()
  storeWithoutMeasuredHeights.data = {
    _table: {
      purchase_last_col: [{ rowId: 1, __details: [{ detailId: 'a' }] }]
    }
  }

  assert.deepStrictEqual(
    storeWithoutMeasuredHeights.computedData(
      'purchase_last_col',
      { body: { children: [] } },
      0,
      100
    ),
    [],
    'rows without measured detail heights should be left untouched'
  )
  assert.deepStrictEqual(
    storeWithoutMeasuredHeights.data._table.purchase_last_col.map(
      item => item.rowId
    ),
    [1],
    'missing detail heights should not remove the source row'
  )

  console.log('empty-details regression checks passed')
}

run()
