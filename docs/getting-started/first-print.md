# 完成第一次打印

本文档将帮助你完成第一次打印。

## 准备工作

确保你已经：
- 安装了 gm-x-printer
- 创建了模板配置
- 准备了打印数据

如果还没有，请先阅读 [创建第一个模板](first-template.md)。

## 打印方式

gm-x-printer 提供了多种打印方式：

1. **Printer 组件** - 在页面中渲染打印内容
2. **doPrint 函数** - 编程式打印
3. **BatchPrinter 组件** - 批量打印（多个模板）
4. **doBatchPrint 函数** - 编程式批量打印

## 方式一：使用 Printer 组件

最简单的打印方式：

```jsx
import { Printer } from 'gm-x-printer'
import 'gm-x-printer/lib/main.css'

function PrintPage() {
  const templateConfig = {
    // 你的模板配置
    name: '简单模板',
    page: { /* ... */ },
    header: { /* ... */ },
    contents: [ /* ... */ ],
    sign: { /* ... */ },
    footer: { /* ... */ }
  }

  const printData = {
    common: {
      收货人: '张三',
      日期: '2026-03-29'
    },
    _table: {
      orders: [
        { 序号: 1, 商品名称: '苹果', 数量: 10 }
      ]
    }
  }

  return (
    <div>
      <h1>打印预览</h1>
      <Printer
        data={printData}
        config={templateConfig}
        onReady={() => {
          console.log('打印准备完成')
        }}
      />
    </div>
  )
}
```

### Printer 组件 Props

| 属性 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| data | object | 是 | 打印数据 |
| config | object | 是 | 模板配置 |
| className | string | 否 | 自定义类名 |
| style | object | 否 | 自定义样式 |
| selected | string | 否 | 选中的元素（用于高亮） |
| selectedRegion | string | 否 | 选中的区域 |
| onReady | function | 否 | 准备完成回调 |

## 方式二：使用 doPrint 函数

编程式打印，适合需要用户点击按钮触发打印的场景：

```jsx
import { doPrint } from 'gm-x-printer'
import 'gm-x-printer/lib/main.css'

function PrintButton() {
  const templateConfig = { /* ... */ }
  const printData = { /* ... */ }

  const handlePrint = async () => {
    try {
      await doPrint({
        data: printData,
        config: templateConfig
      })
      console.log('打印完成')
    } catch (error) {
      console.error('打印失败:', error)
    }
  }

  return (
    <button onClick={handlePrint}>
      打印
    </button>
  )
}
```

### doPrint 参数

```javascript
doPrint(
  // 第一个参数：打印对象
  {
    data: printData,      // 打印数据
    config: templateConfig // 模板配置
  },
  // 第二个参数：是否测试模式（可选）
  false,
  // 第三个参数：额外配置（可选）
  {
    isPreview: false,      // 是否预览
    isTipZoom: false,      // 是否提示缩放
    isPrint: true,         // 是否打印
    isElectronPrint: false // 是否 Electron 打印
  },
  // 第四个参数：准备完成回调（可选）
  () => {
    console.log('准备完成')
  }
)
```

### 打印预览

如果只想预览不打印：

```javascript
doPrint(
  { data: printData, config: templateConfig },
  false,
  {
    isPreview: true,  // 只预览
    isPrint: false    // 不打印
  }
)
```

## 方式三：批量打印

当需要打印多个不同的模板时，使用批量打印：

```jsx
import { BatchPrinter, doBatchPrint } from 'gm-x-printer'
import 'gm-x-printer/lib/main.css'

// 方式 A：使用 BatchPrinter 组件
function BatchPrintPage() {
  const printList = [
    { data: data1, config: config1 },
    { data: data2, config: config2 },
    { data: data3, config: config3 }
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

// 方式 B：使用 doBatchPrint 函数
function BatchPrintButton() {
  const handleBatchPrint = async () => {
    const printList = [
      { data: data1, config: config1 },
      { data: data2, config: config2 }
    ]

    try {
      await doBatchPrint(printList)
      console.log('批量打印完成')
    } catch (error) {
      console.error('批量打印失败:', error)
    }
  }

  return (
    <button onClick={handleBatchPrint}>
      批量打印
    </button>
  )
}
```

## 完整示例

下面是一个完整的打印示例，包含模板配置、数据和打印功能：

```jsx
import React, { useState } from 'react'
import { Editor, Printer, doPrint } from 'gm-x-printer'
import 'gm-x-printer/lib/main.css'

function PrintExample() {
  const [config, setConfig] = useState(null)

  // 模板配置
  const templateConfig = {
    name: '入库单',
    page: {
      name: 'A4',
      type: 'A4',
      size: { width: '210mm', height: '297mm' },
      gap: {
        paddingRight: '10mm',
        paddingLeft: '10mm',
        paddingBottom: '10mm',
        paddingTop: '10mm'
      }
    },
    header: {
      blocks: [
        {
          text: '入库单',
          style: {
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center'
          }
        }
      ],
      style: { height: '60px' }
    },
    contents: [
      {
        blocks: [
          {
            text: '入库日期: {{入库日期}}',
            style: { marginBottom: '10px' }
          },
          {
            text: '供应商: {{供应商}}',
            style: { marginBottom: '10px' }
          }
        ],
        style: { height: 'auto' }
      },
      {
        type: 'table',
        dataKey: 'orders',
        columns: [
          {
            head: '序号',
            headStyle: { textAlign: 'center', width: '60px' },
            style: { textAlign: 'center' },
            text: '{{列.序号}}'
          },
          {
            head: '商品名称',
            headStyle: { textAlign: 'left' },
            style: { textAlign: 'left' },
            text: '{{列.商品名称}}'
          },
          {
            head: '数量',
            headStyle: { textAlign: 'center', width: '80px' },
            style: { textAlign: 'center' },
            text: '{{列.数量}}'
          },
          {
            head: '单价',
            headStyle: { textAlign: 'right', width: '100px' },
            style: { textAlign: 'right' },
            text: '{{列.单价}}'
          }
        ]
      }
    ],
    sign: {
      blocks: [
        { text: '验收人：', style: { right: '50px' } },
        { text: '制单人：', style: { left: '50px' } }
      ],
      style: { height: '60px' }
    },
    footer: {
      blocks: [
        {
          text: '页码：{{当前页码}} / {{页码总数}}',
          style: { textAlign: 'center' }
        }
      ],
      style: { height: '30px' }
    }
  }

  // 打印数据
  const printData = {
    common: {
      入库日期: '2026-03-29',
      供应商: '某某供应商'
    },
    _table: {
      orders: [
        { 序号: 1, 商品名称: '苹果', 数量: 100, 单价: '5.00' },
        { 序号: 2, 商品名称: '香蕉', 数量: 200, 单价: '3.00' },
        { 序号: 3, 商品名称: '橙子', 数量: 150, 单价: '4.00' }
      ]
    }
  }

  const handlePrint = async () => {
    await doPrint({
      data: printData,
      config: config || templateConfig
    })
  }

  return (
    <div>
      <h1>入库单打印示例</h1>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={handlePrint}>
          打印
        </button>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <h2>打印预览</h2>
          <Printer
            data={printData}
            config={config || templateConfig}
          />
        </div>
      </div>
    </div>
  )
}

export default PrintExample
```

## 打印技巧

### 1. 打印前检查

```javascript
const handlePrint = async () => {
  // 检查数据
  if (!printData || !templateConfig) {
    alert('请先准备数据和模板')
    return
  }

  // 执行打印
  await doPrint({ data: printData, config: templateConfig })
}
```

### 2. 错误处理

```javascript
const handlePrint = async () => {
  try {
    await doPrint({ data: printData, config: templateConfig })
    console.log('打印成功')
  } catch (error) {
    console.error('打印失败:', error)
    alert('打印失败，请重试')
  }
}
```

### 3. 打印状态管理

```jsx
const [printing, setPrinting] = useState(false)

const handlePrint = async () => {
  setPrinting(true)
  try {
    await doPrint({ data: printData, config: templateConfig })
  } finally {
    setPrinting(false)
  }
}

return (
  <button onClick={handlePrint} disabled={printing}>
    {printing ? '打印中...' : '打印'}
  </button>
)
```

### 4. 打印后回调

```javascript
const handlePrint = async () => {
  await doPrint({ data: printData, config: templateConfig })

  // 打印完成后的操作
  console.log('打印完成，更新状态')
  updatePrintStatus()
}
```

## 常见问题

### Q: 打印时样式不正确？
A: 确保引入了样式文件 `import 'gm-x-printer/lib/main.css'`。

### Q: 打印内容显示不全？
A: 检查模板配置的 page.gap 和 contents 区域高度是否合理。

### Q: 如何调试打印？
A: 使用 `isPreview: true` 参数先预览，确认无误后再打印。

### Q: 批量打印时如何知道进度？
A: 目前 doBatchPrint 会依次打印所有内容，可以在打印前后添加状态提示。

### Q: 如何在 Electron 中打印？
A: 使用 `isElectronPrint: true` 参数。

## 下一步

- [模板配置详解](../guides/template-config.md) - 深入了解模板配置
- [数据格式说明](../guides/data-format.md) - 了解数据格式
- [组件文档](../components/) - 查看各个组件的详细文档

## 参考资源

- [API 文档](../api/utilities.md) - doPrint 等函数的详细说明
- [打印示例](../../demo/) - 查看更多打印示例
