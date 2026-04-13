# 采购单最后一行重复打印问题分析

## 问题描述
采购单打印时，最后一行有几率会打印两次

## 打印链路梳理

### 1. 数据准备阶段
- **入口**: `src/printer/printer.js` - `WithStorePrinter` 组件
- **数据结构**:
  - `data.common`: 非表格数据（供应商、采购单位等）
  - `data._table`: 表格数据，采购单使用 `purchase_no_detail` 作为 dataKey

### 2. 初始化阶段
**文件**: `src/printer/printer.js`

```javascript
// 1. 创建 PrinterStore
constructor(props) {
  this.printerStore = new PrinterStore(props.batchKey)
}

// 2. 调用 init()
init(config, data) {
  this.ready = false
  this.config = config
  this.data = data
  this.pages = []
  this.tableReady = {} // 标记所有 table 为未就绪
}
```

### 3. 渲染前阶段（计算高度）
**文件**: `src/printer/printer.js` - `renderBefore()`

```javascript
// 渲染所有数据，用于计算高度
<Table
  range={{
    begin: 0,
    end: list.length,  // 渲染所有行
    size: linesPerPage || list.length
  }}
/>
```

**Table 组件职责** (`src/printer/table.js`):
- `componentDidMount()`: 渲染完成后调用 `getTableHeight()`
- `getTableHeight()`: 计算每一行的高度，存储到 `printerStore.tablesInfo`
- 设置 `tableReady[name] = true`

### 4. 分页计算阶段
**文件**: `src/printer/store.js` - `computedPages()`

**核心逻辑**（第844-954行）:

```javascript
// 遍历表格每一行
while (end < heightsLength) {
  currentTableHeight += heights[end]

  if (currentTableHeight > pageAccomodateTableHeight) {
    // 超过页面高度，需要分页

    // 1. 双栏合计特殊处理
    if (dataKey?.includes('multi')) {
      end--  // 回退一行
    }

    // 2. 明细拆分处理（可选）
    if (满足明细拆分条件) {
      computedData(dataKey, table, end, currentRemainTableHeight)
      // 可能会修改 this.data._table[dataKey]
    }

    // 3. 推入当前页
    if (end !== 0) {
      page.push({ type: 'table', index, begin, end })
      this.pages.push(page)
      page = []
    }

    // 4. 开始新页
    begin = end
    // 重置高度...

  } else {
    // 未超过页面高度
    end++

    // 最后一行
    if (end === heightsLength) {
      page.push({ type: 'table', index, begin, end })
      index++
    }
  }
}

// 循环结束后，推入最后一页
this.pages.push(page)
```

### 5. 最终渲染阶段
**文件**: `src/printer/printer.js` - `renderPage()`

```javascript
// 根据 pages 数组渲染
_.map(printerStore.pages, (page, i) => {
  _.map(page, (panel, ii) => {
    <Table
      range={{
        begin: panel.begin,
        end: panel.end,  // 使用计算出的 end
        size: panel.size
      }}
    />
  })
})
```

**Table 组件渲染** (`src/printer/table.js` 第416行):

```javascript
// 使用 range 生成行索引
_.map(_.range(begin, end), i => {
  // 渲染第 i 行
  const data = this.getTableData(i)
})
```

**关键**: `_.range(begin, end)` 是左闭右开，生成 `[begin, begin+1, ..., end-1]`

## 潜在问题分析

### 问题1: computedPages() 被调用两次
**位置**: `src/printer/printer.js` 第148-152行

```javascript
config?.productionMergeType
  ? printerStore.computedRowTablePages()
  : printerStore.computedPages()  // 第一次
/** @decscription 空白行填充补充 */
printerStore.computedPages()  // 第二次
```

**影响**:
- 第一次调用可能修改 `this.data._table[dataKey]`（通过 `computedData()`）
- 第二次调用基于修改后的数据重新计算
- 可能导致分页结果不一致

### 问题2: 明细拆分逻辑
**位置**: `src/printer/store.js` 第877-905行

```javascript
if (满足明细拆分条件) {
  const detailsPageHeight = this.computedData(
    dataKey,
    table,
    end,
    currentRemainTableHeight
  )
  if (detailsPageHeight.length > 0) {
    heights.splice(end, 1, ...detailsPageHeight)  // 修改 heights 数组
    end++
  }
}
```

**影响**:
- `heights` 数组被修改，长度增加
- 如果在最后一行触发，可能导致索引混乱

### 问题3: 最后一页的处理
**位置**: `src/printer/store.js` 第937-945行

```javascript
if (end === heightsLength) {
  page.push({ type: 'table', index, begin, end })
  index++
}
```

然后在第990行:
```javascript
this.pages.push(page)
```

**潜在问题**:
- 如果 `heightsLength` 在循环中被修改（明细拆分），可能导致判断错误
- 如果最后一次循环同时满足"超过高度"和"最后一行"条件，可能重复推入

### 问题4: end 索引的边界情况
**关键代码**:
```javascript
// 在"超过高度"分支
begin = end  // 不执行 end++

// 在"未超过高度"分支
end++  // 执行 end++
```

**分析**:
- `end` 总是指向"下一页的第一行"
- `page.push({ begin, end })` 意味着渲染 `[begin, end)`，不包含 `end`
- 这是正确的，但需要确保在所有边界情况下都正确

## 可能的Bug场景

### 场景1: 明细拆分导致的索引错误
```
假设有10行数据，最后一行有明细：
1. 循环到 end=9，heightsLength=10
2. 最后一行超过高度，触发明细拆分
3. heights 被修改，变成11行（拆分成2个明细）
4. heightsLength 变为 11
5. end++，变成 10
6. 循环继续，但 heightsLength 已经变了
7. 可能导致 end=10 或 end=11 时重复处理
```

### 场景2: computedPages() 重复调用
```
1. 第一次 computedPages():
   - 计算分页，可能修改 data._table
   - 生成 pages 数组

2. 第二次 computedPages():
   - 基于修改后的 data._table 重新计算
   - 可能生成不同的 pages 数组
   - 但 tablesInfo 还是基于原始数据
```

### 场景3: 最后一行刚好满页
```
1. 循环到 end=9（最后一行）
2. currentTableHeight 刚好等于 pageAccomodateTableHeight
3. 进入 else 分支（未超过）
4. end++，变成 10
5. end === heightsLength，推入 page
6. 但 begin=9, end=10
7. 如果之前有分页，可能 begin 的值不对
```

## 需要进一步调查的问题

1. **采购单是否有明细拆分?**
   - 查看 `purchase_no_detail` 是否有 `__details` 字段
   - 查看 specialConfig 配置

2. **采购单是否开启了自动填充?**
   - autoFillConfig 是否配置
   - 是否影响 heightsLength

3. **具体的重复表现?**
   - 是数据完全相同的一行出现两次?
   - 还是某一页的最后一行和下一页的第一行相同?
   - 在第一页重复，还是在最后一页重复?

4. **是否与特定数据有关?**
   - 数据量多少时会出现?
   - 是否与行高有关?

## 建议的调试步骤

1. **添加日志**:
   ```javascript
   // 在 computedPages() 关键位置添加
   console.log('分页计算:', { begin, end, heightsLength, page })
   console.log('推入页面:', page)
   console.log('最终 pages:', this.pages)
   ```

2. **检查 pages 数组**:
   ```javascript
   // 在 renderPage() 前添加
   console.log('渲染页面:', printerStore.pages)
   console.log('每页的 range:', printerStore.pages.map(p => p.map(panel => ({
     type: panel.type,
     begin: panel.begin,
     end: panel.end
   }))))
   ```

3. **验证 range 生成**:
   ```javascript
   // 在 Table 组件中
   const range = _.range(begin, end)
   console.log('渲染行索引:', range)
   ```

4. **检查数据是否被修改**:
   ```javascript
   // 在 computedData() 中
   console.log('明细拆分前:', tableData.length)
   console.log('明细拆分后:', tableData.length)
   ```

## 下一步行动

1. 确认具体的复现步骤和数据
2. 添加调试日志，收集更多信息
3. 根据收集的信息，定位具体的bug位置
4. 修复后添加单元测试，防止回归
