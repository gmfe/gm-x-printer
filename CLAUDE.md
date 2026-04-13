# gm-x-printer 项目指南（AI 助手专用）

## 项目概览

**项目类型:** React 打印组件库
**核心价值:** 提供可配置的打印模板系统，支持可视化编辑和多种业务场景
**技术栈:** React 16.14 + MobX 4.3 + Less
**当前版本:** 1.17.0

## 核心概念（5 分钟理解项目）

gm-x-printer 的核心是一个**模板驱动**的打印系统：

1. **模板配置 (Template Config)** - 定义打印样式和布局
   - 包含 page、header、contents、sign、footer 五大区域
   - 支持 A4、A5、A6 等多种纸张规格
   - 支持横向/纵向打印

2. **数据格式 (Data Format)** - 提供打印内容
   - common: 非表格数据（如收货人、日期等）
   - _table: 表格数据（7 种类型：orders、orders_multi、orders_category 等）

3. **区域系统 (Regions)** - 页面布局
   - header: 页眉（每页渲染）
   - contents: 主要内容（第一页放不下顺延到次页）
   - sign: 签名（只在最后一页）
   - footer: 页脚（每页渲染）

4. **编辑器 (Editor)** - 可视化配置模板
   - 20+ 种业务场景编辑器
   - 支持拖拽、预览、保存

5. **打印器 (Printer)** - 渲染和打印
   - Printer: 单个打印
   - BatchPrinter: 批量打印
   - doPrint: 编程式打印

## 组件分类速查表

### 按业务场景分类

| 业务场景 | 组件 | 文档位置 | 主要用途 |
|---------|------|---------|---------|
| **通用** | Editor | [components/editors-basic.md](docs/components/editors-basic.md) | 通用模板编辑器 |
| **通用** | Printer, BatchPrinter | [components/printers.md](docs/components/printers.md) | 打印组件 |
| **入库** | EditorStockIn | [components/editors-stock.md](docs/components/editors-stock.md) | 入库单 |
| **出库** | EditorStockOut | [components/editors-stock.md](docs/components/editors-stock.md) | 出库单 |
| **调拨** | EditorCannibalize | [components/editors-stock.md](docs/components/editors-stock.md) | 调拨单 |
| **领料** | EditorMaterialRequisition | [components/editors-stock.md](docs/components/editors-stock.md) | 领料单 |
| **采购** | EditorPurchase | [components/editors-purchase.md](docs/components/editors-purchase.md) | 采购单 |
| **采购需求** | EditorPurchaseDemand | [components/editors-purchase.md](docs/components/editors-purchase.md) | 采购需求 |
| **结算** | EditorSettle | [components/editors-finance.md](docs/components/editors-finance.md) | 结算单 |
| **账单** | EditorStatement | [components/editors-finance.md](docs/components/editors-finance.md) | 对账单 |
| **账户账单** | EditorAccoutStatement | [components/editors-finance.md](docs/components/editors-finance.md) | 账户对账单 |
| **账户** | EditorAccount | [components/editors-finance.md](docs/components/editors-finance.md) | 账户 |
| **供应商结算** | EditorSupplierSettleSheet | [components/editors-finance.md](docs/components/editors-finance.md) | 供应商结算 |
| **菜单** | EditorSaleMenus | [components/editors-sale.md](docs/components/editors-sale.md) | 销售菜单 |
| **售后** | EditorAfterSales | [components/editors-sale.md](docs/components/editors-sale.md) | 售后单 |
| **电商** | EditEshop | [components/editors-sale.md](docs/components/editors-sale.md) | 电商订单 |
| **生产** | EditorProduction | [components/editors-production.md](docs/components/editors-production.md) | 生产单 |
| **分拣** | EditorSorting | [components/editors-production.md](docs/components/editors-production.md) | 分拣单 |
| **箱标签** | EditorBoxLabel | [components/editors-production.md](docs/components/editors-production.md) | 箱标签 |
| **票据** | EditorTicket | [components/editors-production.md](docs/components/editors-production.md) | 票据 |
| **管理** | EditorManage | [components/editors-production.md](docs/components/editors-production.md) | 管理单 |

### 工具函数

| 函数 | 用途 | 文档位置 |
|------|------|---------|
| doPrint | 执行单个打印 | [api/utilities.md](docs/api/utilities.md) |
| doBatchPrint | 执行批量打印 | [api/utilities.md](docs/api/utilities.md) |
| getCSS | 获取打印样式 | [api/utilities.md](docs/api/utilities.md) |
| insertCSS | 插入样式到目标元素 | [api/utilities.md](docs/api/utilities.md) |
| renderBatchPrintToDom | 渲染批量打印到 DOM | [api/utilities.md](docs/api/utilities.md) |

## 常见任务快速定位

### 我要开始使用这个库
- 如何安装？→ [docs/getting-started/installation.md](docs/getting-started/installation.md)
- 如何创建第一个模板？→ [docs/getting-started/first-template.md](docs/getting-started/first-template.md)
- 如何完成第一次打印？→ [docs/getting-started/first-print.md](docs/getting-started/first-print.md)

### 我要配置打印模板
- 模板配置详解 → [docs/guides/template-config.md](docs/guides/template-config.md)
- 数据格式说明 → [docs/guides/data-format.md](docs/guides/data-format.md)
- 区域系统详解 → [docs/guides/regions.md](docs/guides/regions.md)

### 我要使用特定业务场景
- 入库单打印 → [docs/components/editors-stock.md#EditorStockIn](docs/components/editors-stock.md)
- 出库单打印 → [docs/components/editors-stock.md#EditorStockOut](docs/components/editors-stock.md)
- 采购单打印 → [docs/components/editors-purchase.md#EditorPurchase](docs/components/editors-purchase.md)
- 结算单打印 → [docs/components/editors-finance.md#EditorSettle](docs/components/editors-finance.md)
- 其他场景 → 查看上方组件分类速查表

### 我要查看 API
- TypeScript 类型 → [docs/api/types.md](docs/api/types.md)
- 工具函数 → [docs/api/utilities.md](docs/api/utilities.md)

## 开发规范

### 组件命名规则
- 编辑器组件：`Editor` + 业务场景（如 EditorStockIn、EditorPurchase）
- 打印组件：`Printer`（单个）、`BatchPrinter`（批量）

### 数据格式约定
- 模板数据必须包含 `common` 和 `_table` 字段
- `_table` 支持 7 种类型：orders、orders_multi、orders_multi_vertical、orders_category、orders_category_multi、orders_category_multi_vertical

### 文件结构导航

```
src/
├── index.js                    # 组件导出入口
├── config.js                   # 打印配置信息
├── util.js                     # 工具函数
├── editor/                     # 编辑器组件
│   ├── index.js                # 通用编辑器
│   ├── editor_stockin.js       # 入库编辑器
│   ├── editor_stockout.js      # 出库编辑器
│   └── ...（每个业务场景一个文件）
├── printer/                    # 打印组件
│   ├── index.js                # 打印入口
│   ├── printer.js              # Printer 组件
│   └── batch_printer.js        # BatchPrinter 组件
├── template_config/            # 模板配置示例
│   └── ...（各种业务场景的模板配置）
├── data_to_key/                # 数据转换
├── mock_data/                  # 模拟数据
└── locales/                    # 多语言文件
```

## 使用示例

### 最简使用

```jsx
import { Editor, Printer } from 'gm-x-printer'

// 1. 编辑模板
<Editor
  config={templateConfig}
  mockData={mockData}
  onSave={(config) => {
    // 保存配置
  }}
  showEditor={true}
  addFields={addFields}
/>

// 2. 打印
<Printer
  data={data}
  config={config}
/>
```

### 编程式打印

```jsx
import { doPrint } from 'gm-x-printer'

// 执行打印
doPrint({
  data: printData,
  config: templateConfig
})
```

## 关键文件说明

| 文件/目录 | 用途 | 何时查看 |
|----------|------|---------|
| `src/index.js` | 查看所有导出的组件 | 需要了解有哪些组件可用 |
| `global.d.ts` | TypeScript 类型定义 | 需要了解组件的 props 类型 |
| `src/template_config/` | 模板配置示例 | 需要参考模板配置格式 |
| `src/mock_data/` | 模拟数据示例 | 需要了解数据格式 |
| `src/editor/` | 编辑器组件实现 | 需要修改或扩展编辑器 |
| `src/printer/` | 打印组件实现 | 需要修改或扩展打印功能 |

## 注意事项

1. **优先初始化语言设置** - 使用组件前必须先调用 `setLocale()`（参见 src/index.js）
2. **数据格式必须匹配** - 不同业务场景需要不同的数据格式（参见 data-format.md）
3. **模板配置必须完整** - 必须包含 page、header、contents、sign、footer 五个区域
4. **编辑器需要 mockData** - 编辑器组件需要模拟数据来预览效果

## 常见问题

**Q: 如何选择合适的编辑器组件？**
A: 根据业务场景选择，参考上方组件分类速查表。如果不确定，先用通用 Editor。

**Q: 模板配置太复杂，有没有简单示例？**
A: 查看 [docs/getting-started/first-template.md](docs/getting-started/first-template.md) 和 `src/template_config/` 目录。

**Q: 数据格式不清楚怎么办？**
A: 查看 [docs/guides/data-format.md](docs/guides/data-format.md) 和 `src/mock_data/` 目录。

**Q: 如何批量打印？**
A: 使用 BatchPrinter 组件或 doBatchPrint 函数，参见 [docs/components/printers.md](docs/components/printers.md)。

## 更新日志

- 2026-03-29: 创建文档
