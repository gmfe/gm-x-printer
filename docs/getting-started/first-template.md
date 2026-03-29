# 创建第一个模板

本文档将帮助你创建第一个打印模板。

## 模板结构

一个完整的模板配置包含 5 个区域：

```javascript
const templateConfig = {
  name: '模板名称',    // 模板名称
  page: {},           // 页面配置
  header: {},         // 页眉（每页渲染）
  contents: [],       // 主要内容（第一页放不下顺延到次页）
  sign: {},           // 签名（只在最后一页）
  footer: {}          // 页脚（每页渲染）
}
```

## 最简模板示例

让我们创建一个最简单的模板：

```jsx
import { Editor } from 'gm-x-printer'
import 'gm-x-printer/lib/main.css'

const simpleTemplate = {
  name: '简单模板',
  page: {
    name: 'A4',
    type: 'A4',
    size: {
      width: '210mm',
      height: '297mm'
    },
    printDirection: 'vertical', // vertical 或 horizontal
    gap: {
      paddingRight: '5mm',
      paddingLeft: '5mm',
      paddingBottom: '5mm',
      paddingTop: '5mm'
    }
  },
  header: {
    blocks: [
      {
        text: '收货人: {{收货人}}',
        style: {
          left: '10px',
          top: '10px',
          position: 'absolute',
          fontSize: '14px'
        }
      }
    ],
    style: {
      height: '50px',
      borderBottom: '1px solid #000'
    }
  },
  contents: [
    {
      blocks: [
        {
          text: '订单详情',
          style: {
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '20px'
          }
        }
      ],
      style: {
        height: 'auto'
      }
    }
  ],
  sign: {
    blocks: [
      {
        text: '签收人：',
        style: {
          right: '50px',
          bottom: '10px',
          position: 'absolute'
        }
      }
    ],
    style: {
      height: '50px'
    }
  },
  footer: {
    blocks: [
      {
        text: '页码：{{当前页码}} / {{页码总数}}',
        style: {
          left: '50%',
          bottom: '5px',
          position: 'absolute',
          transform: 'translateX(-50%)'
        }
      }
    ],
    style: {
      height: '30px'
    }
  }
}

const mockData = {
  common: {
    收货人: '张三'
  }
}

const addFields = {
  commonFields: [
    { text: '收货人', value: '收货人' }
  ]
}

function MyTemplateEditor() {
  const handleSave = (config) => {
    console.log('保存的配置:', config)
  }

  return (
    <Editor
      config={simpleTemplate}
      mockData={mockData}
      onSave={handleSave}
      showEditor={true}
      addFields={addFields}
    />
  )
}
```

## 模板配置详解

### 1. page - 页面配置

```javascript
page: {
  name: 'A4',              // 纸张名称
  type: 'A4',              // 纸张类型：A4, A5, A6 等
  size: {
    width: '210mm',        // 宽度
    height: '297mm'        // 高度
  },
  printDirection: 'vertical', // 打印方向：vertical(纵向), horizontal(横向)
  gap: {
    paddingRight: '5mm',   // 右边距
    paddingLeft: '5mm',    // 左边距
    paddingBottom: '5mm',  // 下边距
    paddingTop: '5mm'      // 上边距
  }
}
```

### 2. header - 页眉

页眉会在每一页都渲染。

```javascript
header: {
  blocks: [
    {
      text: '标题文本 {{变量名}}', // 支持模板变量
      style: {
        // CSS 样式
        left: '10px',
        top: '10px',
        position: 'absolute'
      }
    }
  ],
  style: {
    height: '50px' // 页眉高度
  }
}
```

### 3. contents - 主要内容

主要内容只在第一页渲染，如果放不下会自动顺延到下一页。

```javascript
contents: [
  {
    blocks: [
      {
        text: '文本内容',
        style: {}
      }
    ],
    style: {
      height: 'auto' // auto 表示自适应高度
    }
  },
  {
    type: 'table',     // 表格类型
    dataKey: 'orders', // 数据键名
    columns: [         // 列配置
      {
        head: '列标题',
        headStyle: {},
        style: {},
        text: '{{列.字段名}}'
      }
    ]
  }
]
```

### 4. sign - 签名

签名只在最后一页渲染。

```javascript
sign: {
  blocks: [
    {
      text: '签收人：',
      style: {}
    }
  ],
  style: {
    height: '50px'
  }
}
```

### 5. footer - 页脚

页脚会在每一页都渲染。

```javascript
footer: {
  blocks: [
    {
      text: '页码：{{当前页码}} / {{页码总数}}',
      style: {}
    }
  ],
  style: {
    height: '30px'
  }
}
```

## 模板变量

使用 `{{变量名}}` 语法插入动态内容：

```javascript
// 模板配置中
text: '收货人: {{收货人}}'

// 数据中
const data = {
  common: {
    收货人: '张三'
  }
}

// 渲染结果：收货人: 张三
```

### 内置变量

- `{{当前页码}}` - 当前页码
- `{{页码总数}}` - 总页数

### 表格变量

在表格中使用 `{{列.字段名}}`：

```javascript
columns: [
  {
    head: '商品名称',
    text: '{{列.商品名称}}'
  },
  {
    head: '数量',
    text: '{{列.数量}}'
  }
]
```

## 带表格的模板

下面是一个带表格的完整示例：

```javascript
const tableTemplate = {
  name: '商品清单',
  page: {
    name: 'A4',
    type: 'A4',
    size: { width: '210mm', height: '297mm' },
    gap: { paddingRight: '5mm', paddingLeft: '5mm', paddingBottom: '5mm', paddingTop: '5mm' }
  },
  header: {
    blocks: [
      { text: '商品清单', style: { fontSize: '20px', fontWeight: 'bold' } }
    ],
    style: { height: '50px' }
  },
  contents: [
    {
      type: 'table',
      dataKey: 'orders',
      columns: [
        {
          head: '序号',
          headStyle: { textAlign: 'center', width: '50px' },
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
    blocks: [],
    style: { height: '50px' }
  },
  footer: {
    blocks: [
      { text: '页码：{{当前页码}} / {{页码总数}}', style: { textAlign: 'center' } }
    ],
    style: { height: '30px' }
  }
}

const tableData = {
  common: {},
  _table: {
    orders: [
      { 序号: 1, 商品名称: '苹果', 数量: 10, 单价: '5.00' },
      { 序号: 2, 商品名称: '香蕉', 数量: 20, 单价: '3.00' },
      { 序号: 3, 商品名称: '橙子', 数量: 15, 单价: '4.00' }
    ]
  }
}
```

## 使用编辑器

### 打开编辑器

```jsx
<Editor
  config={templateConfig}
  mockData={mockData}
  onSave={(config) => {
    // 保存配置
    console.log('保存的配置:', config)
  }}
  showEditor={true}
  addFields={addFields}
/>
```

### 编辑器功能

1. **可视化编辑** - 拖拽调整位置和大小
2. **实时预览** - 编辑时实时查看效果
3. **添加字段** - 从预设字段列表添加
4. **保存配置** - 保存编辑后的配置

### addFields 配置

```javascript
const addFields = {
  commonFields: [
    { text: '收货人', value: '收货人' },
    { text: '发货人', value: '发货人' },
    { text: '日期', value: '日期' }
  ],
  tableFields: [
    { text: '商品名称', value: '商品名称' },
    { text: '数量', value: '数量' },
    { text: '单价', value: '单价' }
  ],
  summaryFields: [
    { text: '总数量', value: '总数量' },
    { text: '总金额', value: '总金额' }
  ]
}
```

## 下一步

- [完成第一次打印](first-print.md) - 学习如何打印
- [模板配置详解](../guides/template-config.md) - 深入了解模板配置
- [数据格式说明](../guides/data-format.md) - 了解数据格式

## 参考资源

- [模板配置示例](../../src/template_config/) - 查看各种业务场景的模板配置
- [模拟数据示例](../../src/mock_data/) - 查看数据格式示例
