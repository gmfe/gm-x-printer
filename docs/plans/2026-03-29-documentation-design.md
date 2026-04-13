# gm-x-printer 文档补全设计

## 设计日期
2026-03-29

## 项目背景

gm-x-printer 是一个 React 打印组件库，用于 ERP 系统的打印功能。当前项目有 20+ 个编辑器组件和打印组件，但文档不完整，需要补全文档以便 AI 助手和人类开发者能够快速理解和使用这个库。

## 设计目标

1. **AI 优先** - 让 AI 助手（如 Claude）能够快速理解项目结构和用法
2. **兼顾人类** - 为开发者提供清晰的入门指南和 API 参考
3. **全面覆盖** - 所有 20+ 个组件都要有详细文档
4. **标准详细度** - Props 表格 + 代码示例，不过于冗长
5. **中文文档** - 所有文档仅中文

## 设计决策

### 1. 文档类型（已确认）
- API 文档
- 使用指南
- 代码示例
- AI 理解辅助文件（CLAUDE.md）

### 2. 目标读者（已确认）
- AI 助手优先
- 兼顾人类开发者

### 3. 文档与代码关系（已确认）
- 混合方式：核心文档手写，API 参考从 TypeScript 类型提取

### 4. 现有文档处理（已确认）
- 重新组织，不受现有内容限制

### 5. 多语言支持（已确认）
- 仅中文

### 6. 组件覆盖范围（已确认）
- 全部覆盖，所有 20+ 个组件都要详细文档

### 7. API 文档详细程度（已确认）
- 标准：列出所有 props、方法、类型定义，配合简短说明

### 8. 组件文档组织方式（已确认）
- 按业务分组，每组一个文件，约 8 个文件

### 9. 文档位置（已确认）
- README.md 和 CLAUDE.md 在项目根目录
- 其他所有文档在 docs/ 文件夹内

### 10. 示例代码（已确认）
- 暂不创建独立的 examples/ 目录
- 代码示例直接放在组件文档中

## 文档结构设计

```
/项目根目录
├── CLAUDE.md                    # AI 专用入口（最重要）
├── README.md                    # 人类入口
│
└── docs/                        # 所有其他文档集中管理
    ├── getting-started/         # 快速上手（3 个文件）
    │   ├── installation.md      # 安装指南
    │   ├── first-template.md    # 创建第一个模板
    │   └── first-print.md       # 完成第一次打印
    │
    ├── guides/                  # 核心指南（4 个文件）
    │   ├── template-config.md   # 模板配置详解
    │   ├── data-format.md       # 数据格式说明
    │   ├── regions.md           # 区域系统
    │   └── business-scenarios.md # 业务场景总览
    │
    ├── components/              # 组件文档（8 个文件）
    │   ├── editors-basic.md     # Editor（通用编辑器）
    │   ├── editors-stock.md     # 入库、出库、调拨、领料
    │   ├── editors-purchase.md  # 采购单、采购需求
    │   ├── editors-finance.md   # 结算、账单、对账
    │   ├── editors-sale.md      # 菜单、售后、电商
    │   ├── editors-production.md # 生产、分拣
    │   ├── printers.md          # Printer, BatchPrinter
    │   └── utilities.md         # 工具函数
    │
    └── api/                     # API 参考（2 个文件）
        ├── types.md             # TypeScript 类型
        └── utilities.md         # 工具函数 API
```

**总计：约 17 个文档文件 + 2 个根目录文件**

## 核心文档设计

### 1. CLAUDE.md（AI 专用文档）

这是最重要的文档，AI 助手会首先读取它。

**结构：**
- 项目概览
- 核心概念（5 分钟理解项目）
- 组件分类速查表
- 常见任务快速定位
- 开发规范
- 文件结构导航

**设计要点：**
- 快速定位表 - AI 可以通过关键词直接找到对应文档
- 核心概念映射 - 建立概念和文件的对应关系
- 常见任务索引 - 预判用户问题，提供文档路径
- 精简但完整 - 不重复详细内容，只提供导航

### 2. README.md（项目入口）

保持简洁，作为文档索引。

**结构：**
- 项目简介和特性
- 快速开始（安装、基础使用）
- 文档链接
- 本地开发
- 版本发布
- License

### 3. 组件文档模板

每个组件采用统一模板：

**结构：**
- 概述
- 何时使用
- 代码示例（基础用法）
- Props 表格（属性、类型、必填、默认值、说明）
- 相关组件
- 相关文档

### 4. 组件分组

**editors-stock.md** 包含：
- EditorStockIn（入库）
- EditorStockOut（出库）
- EditorCannibalize（调拨）
- EditorMaterialRequisition（领料）

**editors-purchase.md** 包含：
- EditorPurchase（采购单）
- EditorPurchaseDemand（采购需求）

**editors-finance.md** 包含：
- EditorSettle（结算）
- EditorStatement（账单）
- EditorAccoutStatement（对账）
- EditorAccount（账户）
- EditorManage（管理）
- EditorSupplierSettleSheet（供应商结算）

**editors-sale.md** 包含：
- EditorSaleMenus（菜单）
- EditorAfterSales（售后）
- EditEshop（电商）

**editors-production.md** 包含：
- EditorProduction（生产）
- EditorSorting（分拣）
- EditorBoxLabel（箱标签）
- EditorTicket（票据）

**printers.md** 包含：
- Printer
- BatchPrinter

**utilities.md** 包含：
- doPrint
- doBatchPrint
- getCSS
- insertCSS
- renderBatchPrintToDom

## 实施计划

### 阶段 1：创建基础结构
- 创建 docs/ 目录结构
- 创建 CLAUDE.md
- 重构 README.md

### 阶段 2：快速上手文档
- installation.md
- first-template.md
- first-print.md

### 阶段 3：核心指南文档
- template-config.md
- data-format.md
- regions.md
- business-scenarios.md

### 阶段 4：组件文档
- editors-basic.md
- editors-stock.md
- editors-purchase.md
- editors-finance.md
- editors-sale.md
- editors-production.md
- printers.md
- utilities.md

### 阶段 5：API 文档
- types.md
- utilities.md

## 维护策略

1. **CLAUDE.md** - 当添加新组件或重大变更时更新
2. **组件文档** - 当组件 props 变化时更新
3. **API 文档** - 从 TypeScript 类型自动提取，保证同步
4. **指南文档** - 根据用户反馈和最佳实践更新

## 成功标准

1. AI 助手能够通过 CLAUDE.md 快速理解项目并提供准确帮助
2. 新开发者能够在 30 分钟内完成第一次打印
3. 所有组件都有清晰的文档和示例
4. 文档结构清晰，易于维护和扩展

## 附录：现有资源

- package.json - 项目配置
- global.d.ts - TypeScript 类型定义
- src/index.js - 组件导出
- README.md - 现有文档（将被重构）
