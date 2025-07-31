import Big from 'big.js'
import i18next from '../../locales'
import { action, computed, observable, set } from 'mobx'
import { pageTypeMap } from '../config'
import _ from 'lodash'
import {
  dispatchMsg,
  getBlockName,
  exchange,
  regExp,
  getAutoFillingConfig
} from '../util'

class EditorStore {
  @observable
  tableCustomStyle = 'default'

  @observable
  emptyTableData = []

  @observable
  config = null

  @observable
  mockData = []

  @observable
  updateData = false

  @observable
  remainPageHeihgt = 0

  // 初始模板
  originConfig = null

  // 一个能唯一标识某个东西的字符串
  // header
  // header.block.1
  // contents.panel.1.block.1
  // contents.table.2.column.1
  @observable
  selected = null

  /* 选择中区域, 区域唯一标识字符串
     header
     footer
     sign
     contents.panel.n
     contents.table.n
   */
  @observable
  selectedRegion = null

  @observable
  insertPanel = 'header'

  // 是否自动行数填充
  @observable
  isAutoFilling = false

  @observable
  arrange = 'vertical'

  // 每页行数
  @observable
  linesPerPage = undefined

  defaultTableDataKey = 'orders'

  // 大小写顺序
  @observable
  sortPageBigOrSmall = 'small'

  @observable
  sortOrderBigOrSmall = 'big'

  // 合计文案——每页合计
  @observable
  page_total = '合计'

  // 小写文案——每页合计
  @observable
  page_small = '小写：'

  // 大写文案——每页合计
  @observable
  page_big = '大写：'

  // 合计文案——整单合计
  @observable
  order_total = '整单合计'

  // 小写文案——整单合计
  @observable
  order_small = '小写：'

  // 大写文案——整单合计
  @observable
  order_big = '大写：'

  // 当前模板已有的标签
  @observable
  templateTags = null

  @observable
  tags = []

  @observable
  allOrderSummaryShow = false

  @observable
  isShowAllOrderSummaryPer = false

  // 默认table的dataKey
  setTableDataKeyEffect() {} // 改变dataKey后,做的副作用操作

  defaultTableSubtotal = { show: false }

  @action
  init(config, data, templateTags) {
    // batchPrintConfig: 1 不连续打印（一张采购单不出现多供应商）2 连续打印（一张采购单可能出现多个供应商）
    this.config = Object.assign(
      { batchPrintConfig: 1, templateType: 1, __key__: Date.now() },
      config
    )
    if (this.config.allOrderSummaryConfig) {
      console.log(this.config.allOrderSummaryConfig)
    }
    this.originConfig = config
    this.selected = null
    this.selectedRegion = null
    this.insertPanel = 'header'
    this.mockData = data
    this.isAutoFilling = false
    this.linesPerPage = undefined
    this.templateTags = templateTags
    if (this.config.tags) {
      this.tags = this.config.tags.split(',')
    } else {
      this.tags = []
    }
  }

  @action
  setAutoFillingConfig(bol) {
    this.isAutoFilling = bol
  }

  @action
  setLinesPerPage(linesPerPage, isChange = false) {
    let value = linesPerPage
    if (!isNaN(Number(value)) && ![undefined, null, ''].includes(value)) {
      if (Big(value).gt(999)) {
        value = 999
      } else if (Big(value).lt(1)) {
        value = 1
      }
    }
    // 不允许填写小数
    if (value?.toString().includes('.')) {
      value = value.toString().split('.')[0]
    }
    // if (_.isNumber(value)) {
    //   this.linesPerPage = value
    // }

    this.linesPerPage = value
    set(this.config, {
      linesPerPage: value
    })
    if (isChange) {
      this.handleChangeTableData(this.isAutoFilling)
    }
  }

  @computed
  get computedTableVerticalStyle() {
    return this.config.tableVerticalStyle || 'leftToRight'
  }

  @action
  setTableVerticalStyle = value => {
    // 先将分类小计移除，不然会报错
    if (value === 'firstLeftThenRight') {
      const arr = this.selected.split('.')
      const { dataKey } = this.config.contents[arr[2]]
      const keyArr = dataKey.split('_')

      // 左右均分不支持分类小计，所以需要清除掉分类小计
      if (keyArr.includes('category')) {
        keyArr.splice(keyArr.indexOf('category'), 1)
        const newDataKey = keyArr.join('_')
        this.config.contents[arr[2]].dataKey = newDataKey
      } else if (keyArr.includes('fake')) {
        keyArr.splice(keyArr.indexOf('fake'), 1)
        const newDataKey = keyArr.join('_')
        this.config.contents[arr[2]].dataKey = newDataKey
      }
    }
    this.config = {
      ...this.config,
      tableVerticalStyle: value
    }
  }

  @action
  setTemplateTags(tags) {
    this.templateTags = tags
  }

  /** 切换自适应 */
  @action
  toggleIsAdaptive(isAdaptive) {
    this.config.sign.isAdaptive = isAdaptive ?? !this.config?.sign.isAdaptive
    // 这里是为了让config修改后生效
    this.config = { ...this.config }
  }

  /** 是否启用特殊设置 */
  @action
  toggleIsSpecialSetting(val) {
    this.config.specialSettingType = val
    this.config = { ...this.config }
  }

  @action
  changeIsMergeCustomData = e => {
    this.config = {
      ...this.config,
      isMergeCustomData: Number(e.target.value)
    }
  }

  // 自定义字段不同时，是否合并数据
  @computed
  get isMergeCustomData() {
    return this.config.isMergeCustomData
  }

  @computed
  get computedPrinterKey() {
    return _.map(this.config, (v, k) => {
      if (k === '__key__' && v) {
        return v
      } else if (k === 'page') {
        return v.type + 'PAGE' + v.printDirection + v.size.width + v.size.height
      } else if (k === 'contents') {
        return _.map(v, vv => {
          if (vv.type === 'table') {
            return (
              'TABLE' +
              vv.columns.length +
              vv.className +
              vv.dataKey +
              vv.subtotal.show +
              vv.summaryConfig?.pageSummaryShow +
              vv.customerRowHeight
            )
          } else {
            return vv.style ? vv.style.height : ''
          }
        }).join('/')
      } else {
        return v?.style ? v.style.height : ''
      }
    }).join('_')
  }

  @action.bound
  changeTableCustomStyle(v) {
    if (this.selectedRegion) {
      const arr = this.selectedRegion.split('.')
      if (arr.includes('table')) {
        this.config.contents[arr[2]].className = v
        this.tableCustomStyle = v
      }
    }
  }

  @action.bound
  setRemainPageHeight(remainHeight) {
    this.remainPageHeihgt = remainHeight
  }

  @action
  getFilledTableData(tableData) {
    const { autoFillConfig } = this.config
    if (!this.selectedRegion && !autoFillConfig?.checked) return []
    // if (linesPerPage) {
    //   return Array(linesPerPage).fill(filledData)
    // }
    return []
  }

  @action.bound
  handleChangeTableData(isAutoFilling = false) {
    const { autoFillConfig } = this.config
    if (!this.selectedRegion && !autoFillConfig?.checked) return
    const dataKey =
      this.computedTableSpecialConfig?.dataKey || autoFillConfig?.dataKey
    const table = this.mockData._table[dataKey]
    this.setAutoFillingConfig(isAutoFilling)

    set(this.config, {
      autoFillConfig: {
        region: this.selectedRegion,
        dataKey,
        checked: isAutoFilling
      }
    })
    const isAutoFillingBool =
      getAutoFillingConfig(this.isAutoFilling) !== 'manual'
    if (isAutoFillingBool) {
      table.push(...this.getFilledTableData(table))
    } else {
      this.clearExtraTableData(dataKey)
      return
    }
    this.mockData._table[dataKey] = table
  }

  @action
  clearExtraTableData(dataKey) {
    const newTable = this.mockData._table?.[dataKey]?.filter(
      x => !x._isEmptyData
    )
    this.mockData._table[dataKey] = newTable
  }

  @action
  setTags(tags) {
    this.tags = tags
    this.config.tags = tags.join(',')
  }

  @action
  setInsertPanel(panel) {
    this.insertPanel = panel
  }

  @computed
  get computedPanelHeight() {
    return this.config[this.insertPanel].style.height
  }

  @action
  setPanelHeight(height) {
    this.config[this.insertPanel].style.height = height
  }

  @action
  setCombineSkuDetail(d) {
    this.config.combineSkuDetail.show = d
  }

  @action
  setCombineIngredientDetail(d) {
    this.config.ingredientDetail.show = d
  }

  @action
  setPrintBaseUnitSkuOnly(d) {
    this.config = {
      ...this.config,
      printBaseUnitSkuOnly: d
    }
  }

  @action
  setConfigName(name) {
    this.config.name = name
  }

  @action.bound
  setPageSize(field, value) {
    this.config.page.size[field] = value
  }

  @computed
  get computedIsTime() {
    return (
      _.includes(this.computedSelectedInfo.text, i18next.t('时间')) ||
      _.includes(this.computedSelectedInfo.text, i18next.t('日期'))
    )
  }

  // 可选区域
  @computed
  get computedRegionList() {
    if (!this.config) return []

    const contentRegions = this.config.contents.map((v, i) => {
      if (v.type === 'table') {
        return { value: `contents.table.${i}`, text: i18next.t('区域') + i }
      } else {
        return { value: `contents.panel.${i}`, text: i18next.t('区域') + i }
      }
    })

    return [
      { value: 'all', text: i18next.t('请选择区域') },
      { value: 'header', text: i18next.t('页眉') },
      ...contentRegions,
      { value: 'sign', text: i18next.t('签名') },
      { value: 'footer', text: i18next.t('页脚') }
    ]
  }

  @action
  setConfig(config) {
    this.config = config
  }

  @action
  setPagePrintDirection(value) {
    const { size, printDirection } = this.config.page

    // 打印方向切换了, 宽高互换
    if (value !== printDirection) {
      this.config.page = {
        ...this.config.page,
        printDirection: value,
        size: {
          width: size.height,
          height: size.width
        }
      }
    }
  }

  @action
  setSelected(selected = null) {
    this.selected = selected
  }

  // 选择区域
  @action
  setSelectedRegion(selected) {
    this.selectedRegion = selected
  }

  @action
  setSizePageType(type) {
    const { size, gap, name } = pageTypeMap[type]

    this.config.page = {
      ...this.config.page,
      type,
      size,
      gap,
      name
    }
  }

  @action
  setBatchPrintConfig = type => {
    this.config.batchPrintConfig = type
  }

  @action
  setTemplateType = type => {
    this.config.templateType = type
  }

  // 可选区域做相应的提示
  @computed
  get computedSelectedRegionTip() {
    if (!this.selectedRegion) return ''
    return /(contents)|(sign)/g.test(this.selectedRegion)
      ? i18next.t('说明：所选区域的内容仅打印一次')
      : i18next.t('说明：所选区域的内容每页均打印')
  }

  @computed
  get computedRegionIsTable() {
    if (this.selectedRegion) {
      const arr = this.selectedRegion.split('.')
      return arr.includes('table')
    }
  }

  /** 选中的表格数据DataKey  */
  @computed
  get selectedTableDataKey() {
    if (this.computedRegionIsTable) {
      const arr = this.selectedRegion.split('.')
      return this.config.contents[arr[2]].dataKey
    }
    return null
  }

  @computed
  get computedIsSelectBlock() {
    if (this.selected) {
      const arr = this.selected.split('.')
      return arr.length === 3 || (arr.length === 5 && arr[3] === 'block')
    }
  }

  @computed
  get computedIsSelectTable() {
    if (this.selected) {
      const arr = this.selected.split('.')
      return arr.length === 5 && arr[3] === 'column'
    }
  }

  @computed
  get computedSelectedSource() {
    if (!this.selected) {
      return null
    }

    const arr = this.selected.split('.')
    if (arr.length === 3) {
      return this.config[arr[0]].blocks
    } else if (arr.length === 5 && arr[3] === 'block') {
      return this.config.contents[arr[2]].blocks
    } else if (arr.length === 5 && arr[3] === 'column') {
      return this.config.contents[arr[2]].columns
    }
  }

  @computed
  get computedSelectedInfo() {
    if (!this.selected) {
      return null
    }

    const source = this.computedSelectedSource

    const arr = this.selected.split('.')
    if (arr.length === 3) {
      return source[arr[2]]
    } else if (arr.length === 5 && arr[3] === 'block') {
      return source[arr[4]]
    } else if (arr.length === 5 && arr[3] === 'column') {
      return source[arr[4]]
    }
  }

  @action
  setConfigPanelStyle(name, style) {
    const arr = name.split('.')

    if (arr.length === 1) {
      this.config[name].style = style
    } else if (arr.length === 3) {
      this.config.contents[arr[2]].style = style
    }
  }

  @action
  setConfigBlockBy(who, value) {
    if (this.computedIsSelectBlock) {
      const block = this.computedSelectedInfo
      block[who] = value
    }
  }

  @action
  clearAllTableEmptyData() {
    const tableData = this.mockData._table
    for (const [key, table] of Object.entries(tableData)) {
      tableData[key] = table.filter(x => !x._isEmptyData)
    }
    // this.setAutoFillingConfig(false)
    set(this.mockData, {
      _table: tableData
    })
  }

  @action
  addConfigBlock(name, type, pos = {}, link = '') {
    let blocks
    const arr = name.split('.')

    if (arr.length === 1) {
      blocks = this.config[arr[0]].blocks
    } else if (arr.length === 3) {
      blocks = this.config.contents[arr[2]].blocks
    } else {
      return
    }

    switch (type) {
      case '':
      case 'text':
        blocks.push({
          text: i18next.t('请编辑'),
          style: {
            position: 'absolute',
            left: pos.left || '0px',
            top: pos.top || '0px'
          }
        })
        break
      case 'rise':
        blocks.push({
          text: i18next.t('请编辑'),
          style: {
            right: '0px',
            left: pos.left || '0px',
            top: pos.top || '0px',
            position: 'absolute',
            fontWeight: 'bold',
            fontSize: '26px',
            textAlign: 'center'
          },
          type: 'rise'
        })
        break
      case 'line':
        blocks.push({
          type: 'line',
          style: {
            position: 'absolute',
            left: '0px',
            top: pos.top || '0px',
            borderTopColor: 'black',
            borderTopWidth: '1px',
            borderTopStyle: 'solid',
            transform: 'rotate(0)',
            transformOrigin: 'left top',
            width: '100%'
          }
        })
        break
      case 'image':
        blocks.push({
          type: 'image',
          link: link,
          style: {
            position: 'absolute',
            left: pos.left || '0px',
            top: pos.top || '0px',
            width: '100px',
            height: '100px'
          }
        })
        break
      case 'counter':
        blocks.push({
          type: 'counter',
          style: {
            left: '0px',
            top: '0px'
          }
        })
        break
      case 'barcode':
        blocks.push({
          type: 'barcode',
          style: {
            left: '0px',
            top: '5px',
            width: '230px'
          },
          text: `{{barcode}}`
        })
        break
      case 'qrcode':
        blocks.push({
          type: 'qrcode',
          style: {
            left: '0px',
            top: '5px',
            width: '75px',
            height: '75px'
          },
          text: `{{qrcode}}`
        })
        break
      case 'qrcode_trace':
        blocks.push({
          type: 'qrcode_trace',
          style: {
            left: '0px',
            top: '5px',
            width: '75px',
            height: '75px'
          },
          text: `{{qrcode_trace}}`
        })
        break

      // 备注单元格
      case 'remark':
        blocks.push({
          text: i18next.t('请编辑'),
          type: 'remark',
          style: {
            borderColor: 'black',
            borderWidth: '1px',
            borderStyle: 'solid',
            width: '100%'
          }
        })
        break
      default:
        window.alert(i18next.t('出错啦，未识别类型，此信息不应该出现'))
    }

    this.selected = getBlockName(name, blocks.length - 1)

    if (!type || type === 'text' || type === 'rise') {
      // 延迟下 打开textarea
      setTimeout(() => {
        dispatchMsg('gm-printer-block-edit', {
          name: this.selected
        })
      }, 300)
    }
  }

  @action
  setSubtotalShow(name) {
    const arr = name.split('.')
    const table = this.config.contents[arr[2]]

    // 切换的时候，要把对应table的多余空数据清掉
    this.clearExtraTableData(table.dataKey)
    table.subtotal.show = !table.subtotal.show
    this.setAutoFillingConfig('manual')
    set(table.subtotal, {
      isSsuQuantity: false,
      isSsuOtQuantity: false
    })
  }

  @action
  setSubtotalSsuQuantityActiveShow(name) {
    this.updateData = !this.updateData
    const arr = name.split('.')
    const table = this.config.contents[arr[2]]

    if (table.subtotal.isSsuQuantity === undefined) {
      table.subtotal.show = false
      set(table.subtotal, {
        isSsuQuantity: true,
        isSsuOtQuantity: false
      })
    } else {
      table.subtotal.isSsuQuantity = !table.subtotal.isSsuQuantity
      table.subtotal.isSsuOtQuantity = false
      table.subtotal.show = false
    }
  }

  @action
  setSubtotalSsuOtQuantityActiveShow(name) {
    this.updateData = !this.updateData
    const arr = name.split('.')
    const table = this.config.contents[arr[2]]

    if (table.subtotal.isSsuOtQuantity === undefined) {
      table.subtotal.show = false

      set(table.subtotal, {
        isSsuOtQuantity: true,
        isSsuQuantity: false
      })
    } else {
      table.subtotal.isSsuOtQuantity = !table.subtotal.isSsuOtQuantity
      table.subtotal.isSsuQuantity = false
      table.subtotal.show = false
    }
  }

  @action
  setConfigTable(who, value) {
    if (!this.computedIsSelectTable) {
      return
    }
    const column = this.computedSelectedInfo
    column[who] = value
  }

  @action
  changeTableDataKey(name, key) {
    const arr = name.split('.')
    const { dataKey } = this.config.contents[arr[2]]
    const keyArr = dataKey.split('_')
    let newDataKey
    // 当前有这个key则去掉
    if (keyArr.includes(key)) {
      newDataKey = _.without(keyArr, key)
    } else {
      newDataKey = _.concat(keyArr, key)
    }

    newDataKey = _.sortBy(newDataKey, [
      o => o === 'multi',
      o => o === 'category',
      o => o === 'fake',
      o => o === 'orders'
    ])
    this.config.contents[arr[2]].dataKey = newDataKey.join('_')
  }

  @action
  setConfigTableBy(name, who, className) {
    const arr = name.split('.')
    this.config.contents[arr[2]][who] = className
  }

  @action
  exchangeTableColumn(target, source) {
    if (this.computedIsSelectTable) {
      const arr = this.selected.split('.')
      const { columns } = this.config.contents[arr[2]]

      if (target >= 0 && target < columns.length) {
        // 选中列插入到目标列前面
        const sourceEle = columns.splice(source, 1)[0]
        const insertIndex = target > source ? target - 1 : target
        columns.splice(insertIndex, 0, sourceEle)

        arr[4] = insertIndex
        this.selected = arr.join('.')
      }
    }
  }

  @action
  exchangeTableColumnByDiff(diff) {
    if (this.computedIsSelectTable) {
      const arr = this.selected.split('.')
      const { columns } = this.config.contents[arr[2]]

      const source = ~~arr[4]
      const target = source + diff

      if (target >= 0 && target < columns.length) {
        exchange(columns, target, source)

        arr[4] = target
        this.selected = arr.join('.')
      }
    }
  }

  /**
   * 添加字段到Panel
   * @param key
   * @param value
   * @param type block类型
   */
  @action.bound
  addFieldToPanel({ key, value, type }) {
    if (!this.selectedRegion) return
    const arr = this.selectedRegion.split('.')
    let blocks
    // 在header,footer,sign
    if (arr.length === 1) {
      blocks = this.config[arr[0]].blocks
      // contents 里面
    } else if (arr.length === 3) {
      blocks = this.config.contents[arr[2]].blocks
    }

    switch (type) {
      case 'image': {
        blocks.push({
          type: 'image',
          text: value,
          style: {
            position: 'absolute',
            left: '0px',
            top: '0px',
            width: '100px',
            height: '100px'
          }
        })
        break
      }
      case 'qrcode': {
        blocks.push({
          type: 'qrcode',
          text: value,
          style: {
            position: 'absolute',
            left: '0px',
            top: '0px',
            width: '100px',
            height: '100px'
          }
        })
        break
      }

      default: {
        blocks.push({
          text: `${key}：${value}`,
          style: {
            position: 'absolute',
            left: '0px',
            top: '0px'
          }
        })
      }
    }
  }

  /**
   * 添加列到table
   * @param key
   * @param value
   */
  @action.bound
  addFieldToTable({ key, value }) {
    if (this.computedRegionIsTable) {
      const arr = this.selectedRegion.split('.')
      const { columns, dataKey } = this.config.contents[arr[2]]

      columns.push({
        head: key,
        headStyle: {
          textAlign: 'center',
          width: '85px',
          wordBreak: 'break-all'
        },
        text: value,
        style: {
          textAlign: 'center',
          wordBreak: 'break-all'
        }
      })

      this.clearExtraTableData(dataKey)
      this.setAutoFillingConfig('manual')
    }
  }

  @action
  removeField() {
    if (!this.selected) {
      return
    }

    const source = this.computedSelectedSource
    const arr = this.selected.split('.')

    if (arr.length === 3) {
      source.splice(arr[2], 1)
    } else if (arr.length === 5 && arr[1] === 'panel') {
      source.splice(arr[4], 1)
    } else if (arr.length === 5 && arr[1] === 'table') {
      // 获取当前选中的列，isRemove有值的时候，不允许删除
      const noRemove = source[arr[4]]?.noRemove
      // 大于一列和isRemove没有值的时候允许删除
      if (source.length > 1 && !noRemove) {
        source.splice(arr[4], 1)
      }
    }

    this.selected = null
  }

  /**
   * @param {string} name 为绑定在 DOM 上的 data-name
   * @param {0|1} diff 0 表示向上插入、1 表示向下插入
   * @param {string} type 插入元素的类型（为表格、区域）
   */
  @action
  addContentByDiff(name, diff, type) {
    const arr = name.split('.')
    if (arr.length === 3 && arr[0] === 'contents') {
      this.addContent(name, ~~arr[2] + diff, type)
    } else if (arr.length === 5 && arr[3] === 'column') {
      this.addContent(name, ~~arr[2] + diff, type)
    }
    // 向上插入内容时，需要清空当前的选择标记，否则在渲染表格时
    // 因索引偏移导致读取配置错误。
    // 主要场景：表格包含每页合计功能时，选中此表格，并向上插入区块。
    if (diff === 0) {
      this.setSelectedRegion(null)
    }
  }

  @action.bound
  addContent(name, index, type) {
    const defaultTableDataKey = this.defaultTableDataKey
    const defaultTableSubtotal = this.defaultTableSubtotal

    const arr = name.split('.')
    // 添加之前清除selected,否则content改变之后,computedSelectedSource会计算错误
    this.selected = null
    if ((arr.length === 3 || arr.length === 5) && arr[0] === 'contents') {
      if (index >= 0 && index <= this.config.contents.length) {
        if (type === 'table') {
          this.config.contents.splice(index, 0, {
            type: 'table',
            className: '',
            specialConfig: { style: {} },
            dataKey: defaultTableDataKey, // 默认
            subtotal: defaultTableSubtotal, // 默认的每页合计配置
            columns: [
              {
                head: i18next.t('序号'),
                headStyle: {
                  textAlign: 'center',
                  minWidth: '30px'
                },
                text: i18next.t('{{列.序号}}'),
                style: {
                  textAlign: 'center'
                },
                rowSpan: 'rowSpan',
                noRemove: 'isRemove' // 是否允许删除该列
              },
              {
                head: i18next.t('表头'),
                headStyle: {
                  textAlign: 'center',
                  minWidth: '30px'
                },
                text: i18next.t('内容'),
                style: {
                  textAlign: 'center'
                }
              }
            ]
          })
        } else if (type === 'eshop_table') {
          this.config.contents.splice(index, 0, {
            className: '',
            type: 'table',
            dataKey: '1',
            subtotal: {
              show: false
            },
            columns: [
              {
                head: i18next.t('菜品'),
                headStyle: {
                  textAlign: 'center',
                  minWidth: '30px'
                },
                text: i18next.t('{{列.菜品}}'),
                style: {
                  textAlign: 'center'
                },
                noRemove: 'isRemove' // 是否允许删除该列
              }
            ]
          })
        } else {
          this.config.contents.splice(index, 0, {
            blocks: [],
            style: {
              height: '100px'
            }
          })
        }
      }
    }
  }

  @action.bound
  setTableDataKey(dataKey) {
    if (this.selectedRegion) {
      const arr = this.selectedRegion.split('.')
      const table = this.config.contents[arr[2]]
      // 修改要合并的单元格 productionMergeType控制了要合并的单元格是哪个，还控制config的切换
      if (this.config?.productionMergeType) {
        this.config.productionMergeType = dataKey
      }
      this.selected = null // 清空点中项
      table.dataKey = dataKey
      // 改变dataKey后做副作用action
      this.setTableDataKeyEffect(table, dataKey)
      this.clearAllTableEmptyData()
    }
  }

  @computed
  get computedTableDataKeyOfSelectedRegion() {
    if (this.selectedRegion) {
      const arr = this.selectedRegion.split('.')
      if (arr.includes('table')) {
        const dataKey = this.config.contents[arr[2]].dataKey
        return dataKey && dataKey.split('_')[0]
      }
    }
  }

  // 获得表格自定义行高
  @computed
  get computedTableCustomerRowHeight() {
    if (this.selectedRegion) {
      const arr = this.selectedRegion.split('.')
      if (arr.includes('table')) {
        const height = this.config.contents[arr[2]].customerRowHeight
        return height === undefined ? 23 : height
      }
    }
    return 23
  }

  @action.bound
  setTableCustomerRowHeight(val) {
    if (this.selectedRegion) {
      const arr = this.selectedRegion.split('.')
      if (arr.includes('table')) {
        this.config.contents[arr[2]] = {
          ...this.config.contents[arr[2]],
          customerRowHeight: val
        }
        // // 用于触发printer更新最新的剩余高度
        // this.setLineHeight(val)
        this.setAutoFillingConfig('manual')
      }
    }
  }

  // 获得双栏表格排列类型
  @computed
  get computedTableArrange() {
    if (this.selectedRegion) {
      const arr = this.selectedRegion.split('.')
      if (arr.includes('table')) {
        return this.config.contents[arr[2]].arrange || 'lateral'
      }
    }
  }

  // 只是用来触发 render，没有任何作用
  setArrange(val) {
    this.arrange = val
  }

  @action.bound
  setTableArrange(val) {
    if (this.selectedRegion) {
      const arr = this.selectedRegion.split('.')
      if (arr.includes('table')) {
        this.config.contents[arr[2]] = {
          ...this.config.contents[arr[2]],
          arrange: val
        }
        this.changeUpdateData()
      }
    }
  }

  @action
  removeContent(name) {
    const arr = name.split('.')
    if (arr[0] === 'contents') {
      // 保留一个
      if (this.config.contents.length > 1) {
        this.config.contents.splice(arr[2], 1)
        this.selected = null
        this.selectedRegion = null
      }
    }
  }

  @action.bound
  setCounter(field, name) {
    const arr = (name && name.split('.')) || []
    const counter = this.config.contents[arr[2]].blocks[arr[4]]
    let { value } = counter

    // 兼容之前版本
    if (value === undefined) {
      value = ['len']
    }

    if (_.includes(value, field)) {
      const index = value.indexOf(field)
      value.splice(index, 1)
    } else {
      value.push(field)
    }
    const height = `${25 * (value.length + 1) + 5}px`
    // 设置counter value
    this.config.contents[arr[2]].blocks[arr[4]] = {
      ...counter,
      value
    }
    this.config.contents[arr[2]].style = { height }
  }

  @computed
  get computedTableSpecialConfig() {
    if (this.selectedRegion) {
      const arr = this.selectedRegion.split('.')
      const tableConfig = this.config.contents[arr[2]]
      return tableConfig || {}
    } else {
      return {}
    }
  }

  @action.bound
  setSpecialStyle(value) {
    if (this.selectedRegion) {
      const arr = this.selectedRegion.split('.')
      const tableConfig = this.config.contents[arr[2]]

      const oldStyle = tableConfig.specialConfig
        ? tableConfig.specialConfig.style
        : {}
      set(tableConfig, {
        specialConfig: {
          ...tableConfig.specialConfig,
          style: {
            ...oldStyle,
            ...value
          }
        }
      })
    }
  }

  @action.bound
  setSpecialUpperCase() {
    if (this.selectedRegion) {
      const arr = this.selectedRegion.split('.')
      const tableConfig = this.config.contents[arr[2]]

      const oldNeedUpperCase = tableConfig.specialConfig
        ? tableConfig.specialConfig.needUpperCase
        : false
      set(tableConfig, {
        specialConfig: {
          ...tableConfig.specialConfig,
          needUpperCase: !oldNeedUpperCase
        }
      })
    }
  }

  @action.bound
  setSubtotalStyle(value) {
    if (this.selectedRegion) {
      const arr = this.selectedRegion.split('.')
      const subtotalConfig = this.config.contents[arr[2]].subtotal

      const oldStyle = subtotalConfig.style || {}
      set(subtotalConfig, {
        style: {
          ...oldStyle,
          ...value
        }
      })
    }
  }

  // 设置大写是否显示
  @action.bound
  setSubtotalUpperCase(type) {
    this.changeUpdateData()
    if (this.selectedRegion) {
      const arr = this.selectedRegion.split('.')
      const subtotalConfig = this.config.contents[arr[2]].subtotal
      if (type === 'page_checkbox') {
        const oldNeedUpperCase = subtotalConfig.needUpperCase
        set(subtotalConfig, { needUpperCase: !oldNeedUpperCase })
      } else {
        const old_order_needLowerCase = subtotalConfig?.order_needUpperCase
        set(subtotalConfig, { order_needUpperCase: !old_order_needLowerCase })
      }
    }
  }

  // 设置小写是否显示
  @action.bound
  setSubtotalLowerCase(type) {
    this.changeUpdateData()
    if (this.selectedRegion) {
      const arr = this.selectedRegion.split('.')
      const subtotalConfig = this.config.contents[arr[2]].subtotal
      if (type === 'page_checkbox') {
        const oldNeedUpperCase = subtotalConfig.needLowerCase
        set(subtotalConfig, { needLowerCase: !oldNeedUpperCase })
      } else {
        const old_order_needLowerCase = subtotalConfig?.order_needLowerCase
        set(subtotalConfig, { order_needLowerCase: !old_order_needLowerCase })
      }
    }
  }

  // 设置是否自动填充空白
  // @action.bound
  // setAutoFillRemainPage(modify) {
  //   if (this.computedRegionIsTable) {
  //     const tableConfig = this.computedTableSpecialConfig
  //     const extraSpecialConfig = tableConfig.extraSpecialConfig
  //     if (extraSpecialConfig) {
  //       set(extraSpecialConfig, modify)
  //     } else {
  //       set(tableConfig, { extraSpecialConfig: { ...modify } })
  //     }
  //   }
  //   // 这么写才会触发子组件的更新
  //   this.config = Object.assign({}, this.config)
  // }

  @action.bound
  setSummaryConfig(modify) {
    if (this.selectedRegion) {
      const arr = this.selectedRegion.split('.')
      const config = this.config.contents[arr[2]]
      const summaryConfig = config.summaryConfig
      if (summaryConfig) {
        set(summaryConfig, modify)
      } else {
        const init = {
          pageSummaryShow: false,
          totalSummaryShow: false,
          style: { textAlign: 'center', fontSize: '12px' },
          summaryColumns: [],
          pageSummaryText: '合计',
          showPageType: 'row',
          showOrderType: 'row',
          fields: [{ name: '{{列.商品销售额}}', valueField: '商品销售额' }],
          pageUpperCaseText: '大写：',
          pageLowerCaseText: '小写：',
          pageFontSort: 'big'
        }
        set(config, { summaryConfig: { ...init, ...modify } })
      }
      // if ('pageSummaryShow' in modify || 'totalSummaryShow' in modify) {
      //   // 切换的时候，要把对应table的多余空数据清掉
      //   this.clearExtraTableData(config.dataKey)
      // }

      this.config = {
        ...this.config
      }
    }

    // 如果只是勾选要展示的合计类目的选项，则不需要执行以下操作， 否则会重复清空数据
    // if (!('summaryColumns' in modify && 'style' in modify)) {
    //   this.setAutoFillingConfig(false)
    // }
  }

  // 每页合计展示改变
  @action
  changeShowStyle(type, value) {
    this.changeUpdateData()
    if (type === 'pageSummary') {
      this.setSummaryConfig({ showPageType: value })
    } else {
      this.setOrderSummaryConfig({ showOrderType: value })
    }
  }

  @action
  changeChoseSummaryField(type, value) {
    console.log(type, value)
    this.changeUpdateData()
    if (type === 'chose_page_summary_field') {
      this.setSummaryConfig({
        fields: [{ name: value, valueField: regExp(value) }]
      })
    } else {
      this.setOrderSummaryConfig({
        fields: [{ name: value, valueField: regExp(value) }]
      })
    }
  }

  // 改变大小写顺序
  @action
  changeSortBigOrSmall(type, value) {
    this.changeUpdateData()
    if (type === 'page_font_sort') {
      this.sortPageBigOrSmall = value
      this.setSummaryConfig({ pageFontSort: value })
    } else {
      this.sortOrderBigOrSmall = value
      this.setOrderSummaryConfig({ orderFontSort: value })
    }
  }

  @action
  changeAllOrderSummaryShow(value) {
    const arr = this.selectedRegion.split('.')
    const tableConfig = this.config.contents[arr[2]]
    tableConfig.allOrderSummaryShow = value
    this.config = {
      ...this.config
    }
  }

  @action
  changeIsShowAllOrderSummaryPer(value) {
    const arr = this.selectedRegion.split('.')
    const tableConfig = this.config.contents[arr[2]]
    tableConfig.isShowAllOrderSummaryPer = value
  }

  // 修改文案系列
  @action
  changeSumName(type, value) {
    this.changeUpdateData()
    switch (type) {
      case 'page_total':
        this.page_total = value
        this.setSummaryConfig({ pageSummaryText: value })
        break
      case 'page_small':
        this.page_small = value
        this.setSummaryConfig({ pageLowerCaseText: value })
        break
      case 'page_big':
        this.page_big = value
        this.setSummaryConfig({ pageUpperCaseText: value })
        break
      case 'order_total':
        this.order_total = value
        this.setOrderSummaryConfig({ orderSummaryText: value })
        break
      case 'order_small':
        this.order_small = value
        this.setOrderSummaryConfig({ orderLowerCaseText: value })
        break
      case 'order_big':
        this.order_big = value
        this.setOrderSummaryConfig({ orderUpperCaseText: value })
        break
      default:
        break
    }
  }

  // 编辑状态立即更新
  @action
  changeUpdateData() {
    this.updateData = !this.updateData
  }

  // 监听整单展现状态改变
  @action.bound
  setOrderSummaryConfig(modify) {
    if (this.selectedRegion) {
      const arr = this.selectedRegion.split('.')
      const config = this.config.contents[arr[2]]
      const allOrderSummaryConfig = config.allOrderSummaryConfig
      if (allOrderSummaryConfig) {
        set(allOrderSummaryConfig, modify)
      } else {
        const init = {
          fields: [{ name: '{{列.商品销售额}}', valueField: '商品销售额' }],
          style: {
            textAlign: 'center',
            fontSize: '12px'
          },
          orderSummaryShow: false,
          totalSummaryShow: false,
          summaryOrderColumns: [],
          orderSummaryText: '整单合计',
          showOrderType: 'row',
          orderUpperCaseText: '大写：',
          orderLowerCaseText: '小写：',
          orderFontSort: 'big'
        }
        set(config, { allOrderSummaryConfig: { ...init, ...modify } })
      }
      // if ('orderSummaryShow' in modify) {
      //   // 切换的时候，要把对应table的多余空数据清掉
      //   this.clearExtraTableData(config.dataKey)
      // }

      this.config = {
        ...this.config
      }
    }

    // 如果只是勾选要展示的合计类目的选项，则不需要执行以下操作， 否则会重复清空数据
    // if (!('summaryOrderColumns' in modify && 'style' in modify)) {
    //   this.setAutoFillingConfig(false)
    // }
  }

  @action.bound
  setIsPrintTableHeader(selected) {
    if (this.selectedRegion) {
      const arr = this.selectedRegion.split('.')
      if (arr.includes('table')) {
        this.config = {
          ...this.config,
          isPrintTableHeader: !selected
        }
      }
    }
  }

  @action.bound
  setPrintedPageOrderAndTotal(value) {
    this.config.printedPageOrderAndTotal = value
    this.config = {
      ...this.config
    }
  }
}

export default EditorStore
