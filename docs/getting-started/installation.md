# 安装指南

本文档将帮助你安装和配置 gm-x-printer。

## 环境要求

### 必需环境
- Node.js 16.17.1 或更高版本
- React 16.14.0 或更高版本
- yarn 或 npm

### 推荐工具
- VSCode（推荐安装 ESLint 和 Prettier 插件）

## 安装方式

### 使用 npm

```bash
npm install gm-x-printer
```

### 使用 yarn

```bash
yarn add gm-x-printer
```

## 引入样式

使用组件前需要引入样式文件：

```jsx
import 'gm-x-printer/lib/main.css'
```

## 基本配置

### 1. 设置语言（可选）

如果你的应用需要多语言支持，可以在使用组件前设置语言：

```jsx
import { setLocale } from 'gm-x-printer'

// 设置为中文（默认）
setLocale('zh_CN')

// 设置为英文
setLocale('en_US')
```

**注意：** 语言设置必须在使用任何组件之前完成。

### 2. 引入组件

```jsx
import {
  Editor,
  Printer,
  BatchPrinter,
  doPrint,
  doBatchPrint
} from 'gm-x-printer'
```

## TypeScript 支持

本项目包含 TypeScript 类型定义文件 `global.d.ts`，无需额外安装类型包。

```typescript
import { Editor, Printer, EditorProps, PrinterProps } from 'gm-x-printer'

// 类型会自动提示
const editorProps: EditorProps = {
  config: {},
  mockData: {},
  onSave: (config) => {},
  showEditor: true,
  addFields: {}
}
```

## 验证安装

创建一个简单的组件来验证安装是否成功：

```jsx
import React from 'react'
import { Printer } from 'gm-x-printer'
import 'gm-x-printer/lib/main.css'

function App() {
  const simpleConfig = {
    name: '测试模板',
    page: {
      name: 'A4',
      type: 'A4',
      size: { width: '210mm', height: '297mm' },
      gap: {
        paddingRight: '5mm',
        paddingLeft: '5mm',
        paddingBottom: '5mm',
        paddingTop: '5mm'
      }
    },
    header: { blocks: [], style: { height: '50px' } },
    contents: [
      {
        blocks: [
          {
            text: '测试打印',
            style: { fontSize: '24px', textAlign: 'center' }
          }
        ],
        style: { height: '100px' }
      }
    ],
    sign: { blocks: [], style: { height: '30px' } },
    footer: { blocks: [], style: { height: '30px' } }
  }

  const simpleData = {
    common: {}
  }

  return (
    <div>
      <h1>gm-x-printer 安装测试</h1>
      <Printer data={simpleData} config={simpleConfig} />
    </div>
  )
}

export default App
```

如果能看到"测试打印"文字，说明安装成功！

## 本地开发

如果你想参与开发或调试，可以克隆仓库：

```bash
git clone https://github.com/gmfe/gm-x-printer.git
cd gm-x-printer
yarn
yarn start
```

启动后访问 http://localhost:端口，可以看到演示页面。

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

**注意：** 使用 yarn link 时，可能需要修改 `package.json` 中的 main 字段：
- 调试时：`"main": "src/index.js"`
- 发布时：`"main": "lib/main.js"`

或者使用 `yarn build:watch` 监听模式构建。

## 与现有项目集成

### 与 Create React App 项目集成

```bash
# 创建新项目
npx create-react-app my-app
cd my-app

# 安装 gm-x-printer
yarn add gm-x-printer

# 在 src/App.js 中使用
```

### 与 Next.js 项目集成

```bash
# 创建 Next.js 项目
npx create-next-app my-app
cd my-app

# 安装 gm-x-printer
yarn add gm-x-printer

# 注意：由于 gm-x-printer 使用了 window 对象，
# 需要在客户端渲染时使用
```

```jsx
// pages/index.js
import dynamic from 'next/dynamic'

const Printer = dynamic(
  () => import('gm-x-printer').then(mod => mod.Printer),
  { ssr: false }
)

export default function Home() {
  return <Printer data={data} config={config} />
}
```

## 常见安装问题

### Q: 安装后提示找不到模块？
A: 确保已正确安装依赖，并引入了样式文件 `import 'gm-x-printer/lib/main.css'`。

### Q: TypeScript 类型不生效？
A: 确保你的项目 tsconfig.json 中包含了 node_modules/gm-x-printer。

### Q: 样式不生效？
A: 确保在使用组件前引入了样式文件。

### Q: 报错 "window is not defined"？
A: gm-x-printer 依赖浏览器环境，不支持服务端渲染（SSR）。在使用时需要确保代码只在客户端执行。

### Q: yarn link 后还是看不到更新？
A: 尝试以下步骤：
1. 使用 `yarn build:watch` 启动监听模式
2. 在使用项目中删除 node_modules 重新安装
3. 或者修改 package.json 的 main 字段为 `src/index.js`

## 下一步

安装完成后，可以继续学习：

- [创建第一个模板](first-template.md) - 学习如何配置打印模板
- [完成第一次打印](first-print.md) - 学习如何使用打印功能
- [模板配置详解](../guides/template-config.md) - 深入了解模板配置

## 获取帮助

- 查看 [文档](../)
- 提交 [Issue](https://github.com/gmfe/gm-x-printer/issues)
- 查看 [示例代码](../../demo/)
