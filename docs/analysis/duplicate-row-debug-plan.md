# 采购单最后一行重复打印 - 调试方案

## 问题确认

**症状**：
- 第一页最后几行：39，**40，40，41**
- 第二页前几行：**41**，42，43

**分析**：序号40和41被重复打印，说明两个页面的 range 有重叠：
- 第一页 range: `{begin: X, end: Y}`，实际渲染 `[X, Y-1]`
- 第二页 range: `{begin: Y-1, end: Z}`，实际渲染 `[Y-1, Z-1]`
- 重叠部分：`Y-1` 这一行

## 已发现的代码问题

### 问题1: computedPages() 被调用两次

**位置**: `src/printer/printer.js:150-152`

```javascript
// 第一次调用
config?.productionMergeType
  ? printerStore.computedRowTablePages()
  : printerStore.computedPages()  // 第150行

/** @decscription 空白行填充补充 */
printerStore.computedPages()  // 第152行，第二次调用
```

**影响**：
- 第一次调用计算分页
- 第二次调用重新计算（基于相同的数据）
- 如果第二次调用的结果和第一次不一致，会导致渲染错误

### 问题2: heights 数组可能被修改

**位置**: `src/printer/store.js:895`

```javascript
// 明细拆分时修改 heights 数组
heights.splice(end, 1, ...detailsPageHeight)
```

**影响**：
- 第一次调用可能修改 heights，导致数组长度变化
- 第二次调用基于修改后的 heights 计算，可能产生不同结果

## 根本原因假设

### 假设1: 双栏合计逻辑错误（最可能）

**位置**: `src/printer/store.js:857-860`

```javascript
// 双栏合计
if (dataKey?.includes('multi')) {
  /** 正是因为添加了这一行，所以超过了 */
  // 因为超过，所以要退回上一个
  end--
}
```

**问题**：
- 这个逻辑只应该在双栏（multi）时执行
- 但如果某个边界条件下，单栏也错误地执行了 end--，就会导致：
  - 第一页推入 `{begin: 39, end: 42}`（渲染 [39, 40, 41]）
  - begin = 41（end-- 后）
  - 第二页推入 `{begin: 41, end: 44}`（渲染 [41, 42, 43]）
  - **重叠：序号41被重复**

### 假设2: 第二次 computedPages() 的状态不一致

**问题**：
- 第一次调用后，某些状态（如 `this.height`、`this.tablesInfo`）可能被修改
- 第二次调用基于不一致的状态，产生错误的分页结果

### 假设3: 明细拆分导致的索引错误

**问题**：
- 如果采购单配置了明细拆分（specialConfig）
- 在边界情况下，heights 数组被修改，导致索引计算错误

## 调试方案

### 第一步：添加关键日志

在 `src/printer/store.js` 的 `computedPages()` 方法中添加：

```javascript
@action
computedPages() {
  // 每次调用都打印
  console.log('=== computedPages 调用 ===', {
    callStack: new Error().stack,
    heightsLength: this.tablesInfo['contents.table.1']?.body?.heights?.length,
    dataLength: this.data._table['purchase_no_detail']?.length
  })

  // ... 原有代码 ...

  // 在关键位置打印
  while (end < heightsLength) {
    currentTableHeight += heights[end]

    if (currentTableHeight > pageAccomodateTableHeight) {
      console.log('超过高度，分页', {
        end,
        begin,
        overHeight: heights[end],
        currentTableHeight,
        pageAccomodateTableHeight
      })

      const overHeight = heights[end]
      // 双栏合计
      if (dataKey?.includes('multi')) {
        console.log('执行双栏合计 end--', { end, 'end--': end - 1 })
        end--
      }

      // ... 明细拆分 ...

      console.log('推入页面', {
        page: { type: 'table', index, begin, end },
        range: `[${begin}, ${end})`,
        rows: `渲染第 ${begin} 到 ${end - 1} 行`
      })

      if (end !== 0) {
        page.push({ type: 'table', index, begin, end })
        this.pages.push(page)
        page = []
      }

      begin = end
      console.log('新页开始', { begin, end })
    }
  }

  // 循环结束后
  console.log('=== 最终 pages ===', this.pages.map((p, i) => ({
    pageIndex: i,
    panels: p.map(panel => ({
      type: panel.type,
      begin: panel.begin,
      end: panel.end,
      range: `[${panel.begin}, ${panel.end})`
    }))
  })))
}
```

### 第二步：检查是否有 range 重叠

在日志中查找：

```javascript
// 期望：相邻两页的 range 应该是连续的，不重叠
// 第一页: [39, 42) -> 渲染 39, 40, 41
// 第二页: [42, 45) -> 渲染 42, 43, 44

// 如果发现重叠：
// 第一页: [39, 42) -> 渲染 39, 40, 41
// 第二页: [41, 44) -> 渲染 41, 42, 43  // ❌ 41重复了
```

### 第三步：验证数据一致性

在第二次调用 `computedPages()` 前后添加：

```javascript
console.log('第一次 computedPages 完成', {
  pages: printerStore.pages.length,
  heights: printerStore.tablesInfo['contents.table.1']?.body?.heights?.length
})

printerStore.computedPages()  // 第二次

console.log('第二次 computedPages 完成', {
  pages: printerStore.pages.length,
  heights: printerStore.tablesInfo['contents.table.1']?.body?.heights?.length
})
```

### 第四步：检查明细拆分

如果采购单配置了 specialConfig，在 `computedData()` 中添加：

```javascript
@action
computedData(dataKey, table, end, currentRemainTableHeight) {
  console.log('明细拆分', {
    dataKey,
    end,
    beforeLength: this.data._table[dataKey].length,
    detailsData: this.data._table[dataKey][end]?.__details
  })

  // ... 原有逻辑 ...

  console.log('明细拆分后', {
    afterLength: this.data._table[dataKey].length,
    detailsPageHeight
  })
}
```

## 快速修复方案

### 方案1: 移除重复调用（推荐）

**文件**: `src/printer/printer.js`

```javascript
// 第148-152行
config?.productionMergeType
  ? printerStore.computedRowTablePages()
  : printerStore.computedPages()

// 移除第二次调用
// printerStore.computedPages()  // ❌ 删除这一行

if (config.autoFillConfig?.checked) {
  // ...
}
```

**原理**: 如果第一次计算已经正确，第二次调用是多余的，反而可能引入错误。

### 方案2: 只在需要时调用第二次

```javascript
config?.productionMergeType
  ? printerStore.computedRowTablePages()
  : printerStore.computedPages()

// 只在开启自动填充时才重新计算
if (config.autoFillConfig?.checked) {
  this.props.printerStore.setAutofillConfig(config.autoFillConfig?.checked || false)
  this.props.printerStore.changeTableData()
  printerStore.computedPages()  // 数据变化后才重新计算
}
```

### 方案3: 确保 end 不会被错误回退

**文件**: `src/printer/store.js`

```javascript
if (currentTableHeight > pageAccomodateTableHeight) {
  const overHeight = heights[end]

  // 双栏合计
  if (dataKey?.includes('multi')) {
    end--
    console.log('双栏合计 end--', { dataKey, end })  // 添加日志确认
  }

  // 添加保护：确保 end >= begin
  if (end < begin) {
    console.warn('分页逻辑错误：end < begin', { begin, end, dataKey })
    end = begin  // 修正
  }

  // ... 后续逻辑
}
```

## 验证修复

修复后，检查日志：

1. ✅ computedPages() 只调用一次（或第二次调用有明确理由）
2. ✅ 所有页面的 range 连续且不重叠
3. ✅ heights 数组在计算过程中没有被意外修改
4. ✅ 最终渲染的行索引没有重复

## 需要确认的信息

在应用调试方案前，请确认：

1. **采购单配置**：
   - 是否开启了"每页行数"（linesPerPage）？
   - 是否开启了"自动填充"（autoFillConfig）？
   - 是否配置了明细拆分（specialConfig）？

2. **数据情况**：
   - 出现问题时大概有多少行数据？
   - 是否是特定数据才会出现，还是随机出现？

3. **打印配置**：
   - 是直接打印，还是通过编辑器预览？
   - 是否使用批量打印（BatchPrinter）？

请先应用调试方案，收集日志信息，然后我们可以更精准地定位和修复问题。
