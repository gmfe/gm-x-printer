# 采购单最后一行重复打印 - 修复总结

## 问题现象
- 第一页最后几行：39，**40，40，41**
- 第二页前几行：**41**，42，43
- 序号40和41被重复打印

## 根本原因

### 原代码问题
**文件**: `src/printer/printer.js:148-157`

```javascript
// ❌ 问题代码
config?.productionMergeType
  ? printerStore.computedRowTablePages()
  : printerStore.computedPages()  // 第一次计算

/** @decscription 空白行填充补充 */
printerStore.computedPages()  // ❌ 第二次无条件调用

if (config.autoFillConfig?.checked) {
  this.props.printerStore.setAutofillConfig(config.autoFillConfig?.checked || false)
  this.props.printerStore.changeTableData()  // 修改数据
}
```

**问题分析**：
1. `computedPages()` 被无条件调用**两次**
2. 第二次调用基于相同的未修改数据，可能产生不一致的分页结果
3. 在边界情况下（某行刚好超过页面高度），两次计算的 `begin/end` 可能不一致
4. 导致相邻两页的 range 重叠，造成重复渲染

### 为什么会重叠？

假设第一次计算：
```
序号40（索引39）超过高度
推入第一页: {begin: 38, end: 40} -> 渲染 [38, 39]（序号39, 40）
begin = 40
序号41（索引40）推入第二页: {begin: 40, end: 42} -> 渲染 [40, 41]（序号41, 42）
```

第二次计算（基于某些状态差异）：
```
序号40（索引39）刚好不超过高度
序号41（索引40）超过高度
推入第一页: {begin: 38, end: 41} -> 渲染 [38, 39, 40]（序号39, 40, 41）❌
begin = 41
序号42（索引41）推入第二页: {begin: 41, end: 43} -> 渲染 [41, 42]（序号42, 43）
```

最终渲染：
- 第一页渲染两次计算结果的并集：序号39, 40, 40, 41 ❌
- 第二页：序号41, 42, 43 ❌

## 修复方案

### 新代码逻辑
```javascript
// ✅ 修复后的代码
config?.productionMergeType
  ? printerStore.computedRowTablePages()
  : printerStore.computedPages()  // 第一次计算

/** @decscription 空白行填充补充 */
if (config.autoFillConfig?.checked) {
  this.props.printerStore.setAutofillConfig(config.autoFillConfig?.checked || false)

  const beforeLength = this.props.printerStore.data._table[config.autoFillConfig?.dataKey]?.length
  this.props.printerStore.changeTableData()  // 修改数据（添加空白行）
  const afterLength = this.props.printerStore.data._table[config.autoFillConfig?.dataKey]?.length

  // ✅ 只有数据真正变化时才重新计算
  if (afterLength !== beforeLength) {
    config?.productionMergeType
      ? printerStore.computedRowTablePages()
      : printerStore.computedPages()  // 第二次计算（仅在需要时）
  }
}
```

### 修复要点

1. **移除无条件的第二次调用**
   - 原代码无条件调用两次 `computedPages()`
   - 修复后只在必要时调用

2. **检查数据是否真正变化**
   - 记录 `changeTableData()` 前后的数据长度
   - 只有长度改变时才重新计算分页

3. **避免状态不一致**
   - 确保第二次计算基于修改后的数据
   - 避免基于不一致状态的计算

## 测试验证

### 验证步骤

1. **测试采购单打印**
   ```
   准备40-50行数据的采购单
   打印预览
   检查第一页和第二页的边界是否有重复
   ```

2. **验证自动填充功能**
   ```
   开启"自动填充空白行"
   确认空白行正确填充
   确认没有重复渲染
   ```

3. **边界情况测试**
   ```
   测试刚好满页的情况
   测试最后一行刚好超过高度的情况
   测试明细拆分的场景
   ```

### 预期结果

✅ 第一页最后几行：39，40，41，42
✅ 第二页前几行：43，44，45，46
✅ 没有重复的序号
✅ 自动填充功能正常
✅ 分页计算准确

## 影响范围

### 受影响的业务场景
- ✅ 采购单打印（purchase_no_detail）
- ✅ 所有使用普通表格打印的业务
- ✅ 开启了"自动填充"功能的打印模板

### 不受影响的场景
- ⚠️ 生产打印单（productionMergeType）使用 `computedRowTablePages()`
- ⚠️ 配送单（isDeliverType）有独立的分页逻辑
- ⚠️ 双栏打印（multi）有特殊处理

## 后续优化建议

### 1. 添加防御性检查
在 `computedPages()` 中添加：
```javascript
// 确保相邻页面的 range 不重叠
for (let i = 1; i < this.pages.length; i++) {
  const prevPage = this.pages[i-1].find(p => p.type === 'table')
  const currPage = this.pages[i].find(p => p.type === 'table')

  if (prevPage && currPage && prevPage.end > currPage.begin) {
    console.warn('检测到分页重叠', {
      prevPage: `[${prevPage.begin}, ${prevPage.end})`,
      currPage: `[${currPage.begin}, ${currPage.end})`
    })
    // 自动修正
    currPage.begin = prevPage.end
  }
}
```

### 2. 优化 computedPages() 调用时机
考虑将空白行填充逻辑提前到第一次计算之前：
```javascript
// 在第一次计算前就填充数据
if (config.autoFillConfig?.checked) {
  this.props.printerStore.setAutofillConfig(config.autoFillConfig?.checked || false)
  this.props.printerStore.changeTableData()
}

// 只计算一次
config?.productionMergeType
  ? printerStore.computedRowTablePages()
  : printerStore.computedPages()
```

### 3. 添加单元测试
```javascript
describe('分页计算', () => {
  it('不应该产生重复的行', () => {
    const printerStore = new PrinterStore()
    printerStore.init(config, data)
    printerStore.computedPages()

    const allRanges = printerStore.pages
      .flatMap(page => page.filter(p => p.type === 'table'))
      .map(p => _.range(p.begin, p.end))

    const allRows = _.flatten(allRanges)
    const uniqueRows = _.uniq(allRows)

    expect(allRows.length).toBe(uniqueRows.length)
  })
})
```

## 相关文件

- `src/printer/printer.js` - 修复的主要文件
- `src/printer/store.js` - computedPages() 实现
- `docs/analysis/duplicate-row-debug-analysis.md` - 问题分析
- `docs/analysis/duplicate-row-debug-plan.md` - 调试方案

## 修复时间
2026-04-07
