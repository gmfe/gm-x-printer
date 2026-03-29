# gm-x-printer

<div align="center">

可配置的 React 打印组件库，支持可视化模板编辑和多种业务场景。

[![npm version](https://img.shields.io/npm/v/gm-x-printer.svg)](https://www.npmjs.com/package/gm-x-printer)
[![License](https://img.shields.io/npm/l/gm-x-printer.svg)](https://github.com/gmfe/gm-x-printer/blob/master/LICENSE)

</div>

## 特性

- 🎨 **可视化编辑** - 提供模板编辑器，支持拖拽和实时预览
- 📄 **灵活配置** - 支持自定义模板配置，适应各种打印需求
- 🏢 **多业务场景** - 内置 20+ 种业务场景编辑器（入库、出库、采购、结算等）
- 🖨️ **多种打印方式** - 支持单个打印、批量打印、编程式打印
- 📐 **多种纸张规格** - 支持 A4、A5、A6 等多种纸张，支持横向/纵向
- 🌐 **多语言支持** - 支持中英文切换

## 快速开始

### 安装

```bash
npm install gm-x-printer
# 或
yarn add gm-x-printer
```

### 基础使用

#### 1. 编辑模板

```jsx
import { Editor } from 'gm-x-printer'
import 'gm-x-printer/lib/main.css' // 引入样式

function TemplateEditor() {
  const handleSave = (config) => {
    console.log('保存的模板配置:', config)
    // 保存到服务器或本地存储
  }

  return (
    <Editor
      config={initialConfig}      // 初始模板配置
      mockData={mockData}         // 模拟数据用于预览
      onSave={handleSave}         // 保存回调
      showEditor={true}           // 显示编辑器
      addFields={addFields}       // 可添加的字段列表
    />
  )
}
```

#### 2. 打印

```jsx
import { Printer, doPrint } from 'gm-x-printer'

// 方式一：使用 Printer 组件
function PrintPage() {
  return (
    <Printer
      data={printData}       // 打印数据
      config={templateConfig} // 模板配置
      onReady={() => {
        console.log('打印准备完成')
      }}
    />
  )
}

// 方式二：使用 doPrint 函数（编程式打印）
async function handlePrint() {
  await doPrint({
    data: printData,
    config: templateConfig
  })
}
```

#### 3. 批量打印

```jsx
import { BatchPrinter, doBatchPrint } from 'gm-x-printer'

// 方式一：使用 BatchPrinter 组件
function BatchPrintPage() {
  const printList = [
    { data: data1, config: config1 },
    { data: data2, config: config2 },
  ]

  return (
    <BatchPrinter
      list={printList}
      onReady={() => {
        console.log('批量打印准备完成')
      }}
    />
  )
}

// 方式二：使用 doBatchPrint 函数
async function handleBatchPrint() {
  await doBatchPrint([
    { data: data1, config: config1 },
    { data: data2, config: config2 },
  ])
}
```

## 业务场景编辑器

gm-x-printer 提供了 20+ 种业务场景的专用编辑器：

| 业务场景 | 组件 | 说明 |
|---------|------|------|
| 通用 | `Editor` | 通用模板编辑器 |
| 入库 | `EditorStockIn` | 入库单编辑器 |
| 出库 | `EditorStockOut` | 出库单编辑器 |
| 调拨 | `EditorCannibalize` | 调拨单编辑器 |
| 领料 | `EditorMaterialRequisition` | 领料单编辑器 |
| 采购 | `EditorPurchase` | 采购单编辑器 |
| 采购需求 | `EditorPurchaseDemand` | 采购需求编辑器 |
| 结算 | `EditorSettle` | 结算单编辑器 |
| 账单 | `EditorStatement` | 对账单编辑器 |
| 账户账单 | `EditorAccoutStatement` | 账户对账单编辑器 |
| 账户 | `EditorAccount` | 账户编辑器 |
| 供应商结算 | `EditorSupplierSettleSheet` | 供应商结算编辑器 |
| 菜单 | `EditorSaleMenus` | 销售菜单编辑器 |
| 售后 | `EditorAfterSales` | 售后单编辑器 |
| 电商 | `EditEshop` | 电商订单编辑器 |
| 生产 | `EditorProduction` | 生产单编辑器 |
| 分拣 | `EditorSorting` | 分拣单编辑器 |
| 箱标签 | `EditorBoxLabel` | 箱标签编辑器 |
| 票据 | `EditorTicket` | 票据编辑器 |
| 管理 | `EditorManage` | 管理单编辑器 |

## 文档

### 快速开始
- [安装指南](docs/getting-started/installation.md)
- [创建第一个模板](docs/getting-started/first-template.md)
- [完成第一次打印](docs/getting-started/first-print.md)

### 核心概念
- [模板配置详解](docs/guides/template-config.md) - 了解如何配置打印模板
- [数据格式说明](docs/guides/data-format.md) - 了解打印数据的格式
- [区域系统](docs/guides/regions.md) - 了解页眉、页脚、签名等区域
- [业务场景总览](docs/guides/business-scenarios.md) - 了解各种业务场景

### 组件文档
- [编辑器组件](docs/components/) - 所有编辑器组件的详细文档
- [打印组件](docs/components/printers.md) - Printer 和 BatchPrinter 文档

### API 参考
- [TypeScript 类型](docs/api/types.md) - 类型定义
- [工具函数](docs/api/utilities.md) - doPrint、getCSS 等工具函数

## 本地开发

### 环境要求
- Node.js 16.17.1+
- yarn

### 运行

```bash
# 安装依赖
yarn

# 启动开发服务器
yarn start

# 构建生产版本
yarn build

# 监听模式构建（用于 link 调试）
yarn build:watch
```

### 与其他项目联调

使用 yarn link 进行本地调试：

```bash
# 在 gm-x-printer 中
yarn link

# 在需要使用的项目中
yarn link 'gm-x-printer'

# 断开连接
yarn unlink
```

## 版本发布

本项目使用 GitHub Actions 自动发布。

### Beta 版本
1. 在 feature/fix 分支执行 `yarn release`，选择 beta 版本
2. 自动创建 tag 并推送，触发 GitHub Actions

### 正式版本
1. 提 PR 到 master
2. 合并后，在 master 分支执行 `yarn release`，选择正式版本
3. 自动创建 tag、生成 changelog 并发布

详细说明请参考现有 README 中的版本发布流程部分。

## 技术栈

- React 16.14
- MobX 4.3
- Less
- Webpack 4
- jsbarcode (条形码)
- qrcode.react (二维码)

## 项目结构

```
gm-x-printer/
├── src/
│   ├── index.js           # 组件导出
│   ├── editor/            # 编辑器组件
│   ├── printer/           # 打印组件
│   ├── template_config/   # 模板配置示例
│   ├── mock_data/         # 模拟数据
│   ├── data_to_key/       # 数据转换
│   ├── config.js          # 配置
│   └── util.js            # 工具函数
├── lib/                   # 构建产物
├── demo/                  # 演示文件
├── locales/               # 多语言文件
└── docs/                  # 文档
```

## 常见问题

### 如何选择合适的编辑器？
根据你的业务场景选择对应的编辑器。如果不确定，可以先使用通用 `Editor` 组件。

### 如何自定义模板？
参考 [模板配置详解](docs/guides/template-config.md)，了解如何配置各个区域和样式。

### 打印时数据格式不对？
确保数据格式符合要求，参考 [数据格式说明](docs/guides/data-format.md)。

### 如何实现批量打印？
使用 `BatchPrinter` 组件或 `doBatchPrint` 函数，详见 [打印组件文档](docs/components/printers.md)。

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## License

ISC

## 相关链接

- [GitHub](https://github.com/gmfe/gm-x-printer)
- [NPM](https://www.npmjs.com/package/gm-x-printer)
- [问题反馈](https://github.com/gmfe/gm-x-printer/issues)
