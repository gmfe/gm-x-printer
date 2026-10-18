import i18next from '../../locales'
import React from 'react'
import { Flex, Option, Select, Radio, Checkbox } from '../components'
import { observer, inject } from 'mobx-react'
import { DYNAMIC_DEMO_FLAG } from './table_body_type'
import {
  Fonter,
  Gap,
  Line,
  Position,
  Separator,
  Size,
  TextAlign,
  ColumnWidth,
  Textarea,
  ChangeCapCheckbox,
  Title,
  TipInfo
} from '../common/component'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { DiyTimeType } from '../config'

@inject('editStore')
@observer
class EditorField extends React.Component {
  handleChangeBlock = (who, value) => {
    const { editStore } = this.props
    if (!editStore.computedIsSelectBlock) {
      return
    }

    editStore.setConfigBlockBy(who, value)
  }

  handleChangeTable = (who, value) => {
    const { editStore } = this.props
    if (!editStore.computedIsSelectTable) {
      return
    }
    editStore.setConfigTable(who, value)
  }

  handleChangeTableColumn = headStyle => {
    const { editStore } = this.props
    if (!editStore.computedIsSelectTable) {
      return
    }
    const { style } = editStore.computedSelectedInfo
    const _style = { ...style }
    if (headStyle.width === 'auto') {
      delete _style.wordBreak
      delete headStyle.wordBreak
    } else {
      _style.wordBreak = 'break-all'
      headStyle.wordBreak = 'break-all'
    }
    // 设置tbody > tr > td
    editStore.setConfigTable('style', _style)
    // 设置thead > tr > td
    editStore.setConfigTable('headStyle', headStyle)
  }

  handleSetTableBodyType = val => {
    const { editStore, tableBodyTypeFields } = this.props
    if (!editStore.computedIsSelectTable) {
      return
    }
    // selected 与 selectedRegion 是两个独立 action：selected 可能仍指向 table 而
    // selectedRegion 已被「选择区域」切走，解引用前必须校验 region 含 table
    const arr = editStore.selectedRegion
      ? editStore.selectedRegion.split('.')
      : []
    if (!arr.includes('table')) {
      return
    }
    if (val === editStore.computedTableBodyType) {
      return
    }
    let keepTexts
    if (val === 'horizontal_product') {
      keepTexts = _.map(
        _.flatten(_.values(tableBodyTypeFields)),
        o => o.value
      ).filter(v => v)
      const content = editStore.config.contents[arr[2]]
      const removed = (content.columns || []).filter(
        c => c.text && !c[DYNAMIC_DEMO_FLAG] && !keepTexts.includes(c.text)
      )
      if (
        removed.length &&
        !window.confirm(
          i18next.t(
            '切换为商品横向表将移除不受支持的字段列（如 生产日期/保质期），确认切换？'
          )
        )
      ) {
        return
      }
    }
    editStore.setTableBodyType(val, keepTexts)
  }

  handleSetHorizontalSummary = patch => {
    const { editStore } = this.props
    if (!editStore.computedIsSelectTable) {
      return
    }
    // 同 handleSetTableBodyType：selectedRegion 可能已被「选择区域」切走，写值前校验含 table
    const arr = editStore.selectedRegion
      ? editStore.selectedRegion.split('.')
      : []
    if (!arr.includes('table')) {
      return
    }
    editStore.setHorizontalSummaryConfig(patch)
  }

  // 可汇总字段勾选值（1158798739001058039）：未存 summaryFields（存量模板）默认全选
  getSummaryFields(orderSummary) {
    return orderSummary.summaryFields || ['商品总重量', '配餐人数']
  }

  // 可汇总字段勾选切换：需求要求启用整单合计必须至少选一个，取消到空时忽略
  handleToggleSummaryField = (field, checked) => {
    const selectedTableContent = this.getSelectedTableContent()
    if (!selectedTableContent) {
      return
    }
    const orderSummary = selectedTableContent.orderSummary || {}
    const current = this.getSummaryFields(orderSummary)
    const next = checked
      ? _.uniq([...current, field])
      : current.filter(f => f !== field)
    if (!next.length) {
      return
    }
    this.handleSetHorizontalSummary({ summaryFields: next })
  }

  handleSetWeightDivisor = val => {
    const { editStore } = this.props
    if (!editStore.computedIsSelectTable) {
      return
    }
    const arr = editStore.selectedRegion
      ? editStore.selectedRegion.split('.')
      : []
    if (!arr.includes('table')) {
      return
    }
    editStore.setWeightDivisor(val)
  }

  handleSetWeightOperator = val => {
    const { editStore } = this.props
    if (!editStore.computedIsSelectTable) {
      return
    }
    const arr = editStore.selectedRegion
      ? editStore.selectedRegion.split('.')
      : []
    if (!arr.includes('table')) {
      return
    }
    editStore.setWeightOperator(val)
  }

  // 读取当前选中表体 content（selectedRegion 含 table 才有效），供横向表配置控件取值
  getSelectedTableContent() {
    const { editStore } = this.props
    const arr = editStore.selectedRegion
      ? editStore.selectedRegion.split('.')
      : []
    if (arr.includes('table')) {
      return editStore.config.contents[arr[2]]
    }
    return null
  }

  handleSetTableDataKey = dataKey => {
    const { editStore } = this.props
    editStore.setTableDataKey(dataKey)
  }

  renderBlocks() {
    const { editStore } = this.props
    const { type, text, style, link } = editStore.computedSelectedInfo

    return (
      <div>
        <Title title={i18next.t('编辑字段')} />
        <Gap />
        <Position
          style={style}
          onChange={this.handleChangeBlock.bind(this, 'style')}
        />
        <Gap />

        {(!type || type === 'text' || type === 'rise' || type === 'remark') && (
          <div>
            <Fonter
              style={style}
              onChange={this.handleChangeBlock.bind(this, 'style')}
              type={type}
            />
            {/* 非表格字段不显示左中右 */}
            {/* <Separator />
            <TextAlign
              style={style}
              onChange={this.handleChangeBlock.bind(this, 'style')}
            /> */}

            <ChangeCapCheckbox
              style={style}
              value={text}
              onChange={this.handleChangeBlock}
            />

            <Gap />

            <Textarea
              value={text}
              placeholder={i18next.t('请输入填充内容')}
              onChange={this.handleChangeBlock.bind(this, 'text')}
            />
          </div>
        )}
        {type === 'line' && (
          <Line
            style={style}
            onChange={this.handleChangeBlock.bind(this, 'style')}
          />
        )}
        {(type === 'image' ||
          type === 'qrcode' ||
          type === 'qrcode_trace' ||
          type === 'seal' ||
          type === 'seal_customer' ||
          type === 'seal_supplier') && (
          <div>
            <Size
              style={style}
              onChange={this.handleChangeBlock.bind(this, 'style')}
            />
            <Gap />
            {type === 'image' && (
              <Textarea
                value={link}
                placeholder={i18next.t('请输入链接')}
                onChange={this.handleChangeBlock.bind(this, 'link')}
              />
            )}
          </div>
        )}
        <TipInfo
          text={i18next.t('说明：谨慎修改{}中的内容,避免出现数据异常')}
        />
        {editStore.computedIsTime && (
          <div>
            <TipInfo
              text={i18next.t('注：可通过修改“{{}}”中的内容更改时间格式。')}
            />
            {_.map(DiyTimeType, (v, k) => (
              <TipInfo text={`${k + 1}。${v.text}`} />
            ))}
            <TipInfo
              text={`${DiyTimeType.length +
                +1}、指定日期后7天，输入“单据日期：{{addDay(单据日期, 7)}}”；`}
            />
          </div>
        )}
      </div>
    )
  }

  renderTable() {
    const {
      tableDataKeyList,
      editStore,
      type,
      isDeliverType,
      showMergeOption,
      showProductPermutation = true,
      renderExtra,
      tableBodyTypeFields
    } = this.props
    const { head, headStyle, text, style } =
      editStore.computedSelectedInfo || {}
    const selectedTableContent = this.getSelectedTableContent()
    const orderSummary =
      (selectedTableContent && selectedTableContent.orderSummary) || {}
    // 2026-10-14 需求：输入框可删空（undefined 显示空，保存时归一为 0）
    const weightDivisor =
      selectedTableContent && selectedTableContent.weightDivisor
    const weightOperator =
      selectedTableContent && selectedTableContent.weightOperator
    return (
      <div>
        <Title title={i18next.t('编辑字段')} />
        <Gap />

        {tableDataKeyList && !editStore.isSelectingCombine && (
          <>
            <Flex>
              <Flex alignCenter>{i18next.t('数据展示')}：</Flex>
              <Select
                className='gm-printer-edit-select'
                value={editStore.computedTableDataKeyOfSelectedRegion}
                onChange={this.handleSetTableDataKey}
              >
                {tableDataKeyList.map(v => (
                  <Option key={v.value} value={v.value}>
                    {v.text}
                  </Option>
                ))}
              </Select>
            </Flex>
            <Gap height='5px' />
          </>
        )}

        {/* 打印侧仅处理 dataKey '1'（学生餐常规表体），2/3/4（桶餐/净菜/调味品）不展示横向配置 */}
        {tableBodyTypeFields && editStore.selectedTableDataKey === '1' && (
          <>
            <Flex alignCenter>
              <Flex alignCenter>{i18next.t('表体类型')}：</Flex>
              <Select
                className='gm-printer-edit-select'
                value={editStore.computedTableBodyType}
                onChange={this.handleSetTableBodyType}
              >
                <Option value='vertical'>{i18next.t('纵向明细表')}</Option>
                <Option value='horizontal_product'>
                  {i18next.t('商品横向表')}
                </Option>
              </Select>
            </Flex>
            <Flex alignCenter className='gm-padding-top-5 gm-text-desc'>
              {i18next.t('商品横向表仅支持按班级汇总打印')}
            </Flex>
            {editStore.computedTableBodyType === 'horizontal_product' && (
              <>
                <Flex alignCenter className='gm-padding-top-5'>
                  <Flex alignCenter>{i18next.t('整单合计')}：</Flex>
                  <Select
                    className='gm-printer-edit-select'
                    value={orderSummary.show ? 'on' : 'off'}
                    onChange={v =>
                      this.handleSetHorizontalSummary({ show: v === 'on' })
                    }
                  >
                    <Option value='off'>{i18next.t('关闭')}</Option>
                    <Option value='on'>{i18next.t('开启')}</Option>
                  </Select>
                </Flex>
                {orderSummary.show && (
                  <>
                    <Flex alignCenter className='gm-padding-top-5'>
                      <Flex alignCenter>{i18next.t('可汇总字段')}：</Flex>
                      <Flex row>
                        {[
                          {
                            field: '商品总重量',
                            label: i18next.t('商品总重量')
                          },
                          { field: '配餐人数', label: i18next.t('配餐人数') }
                        ].map(({ field, label }) => (
                          <Checkbox
                            key={field}
                            checked={this.getSummaryFields(
                              orderSummary
                            ).includes(field)}
                            onChange={checked =>
                              this.handleToggleSummaryField(field, checked)
                            }
                          >
                            <span className='gm-padding-left-5'>{label}</span>
                          </Checkbox>
                        ))}
                      </Flex>
                    </Flex>
                    <Flex className='gm-padding-top-5 gm-text-desc'>
                      {i18next.t(
                        '启用整单合计必须要选择至少一个汇总字段才能显示'
                      )}
                    </Flex>
                  </>
                )}
                {orderSummary.show && (
                  <>
                    <Flex alignCenter className='gm-padding-top-5'>
                      <Flex alignCenter>{i18next.t('重量换算')}：</Flex>
                      <Select
                        className='gm-printer-edit-select'
                        value={weightOperator || 'divide'}
                        onChange={v => this.handleSetWeightOperator(v)}
                      >
                        <Option value='divide'>{i18next.t('÷ 除以')}</Option>
                        <Option value='multiply'>{i18next.t('× 乘以')}</Option>
                      </Select>
                    </Flex>
                    <Flex alignCenter className='gm-padding-top-5'>
                      <Flex alignCenter>{i18next.t('换算数值')}：</Flex>
                      <input
                        value={
                          weightDivisor === undefined
                            ? ''
                            : String(weightDivisor)
                        }
                        onChange={e =>
                          this.handleSetWeightDivisor(e.target.value)
                        }
                        type='number'
                        className='gm-printer-edit-input-custom'
                        style={{ width: '120px' }}
                      />
                    </Flex>
                    <Flex alignCenter className='gm-padding-top-5 gm-text-desc'>
                      {(weightOperator || 'divide') === 'divide'
                        ? i18next.t(
                            '合计除以该数（例 500 = 克转斤）；留空保存为 0'
                          )
                        : i18next.t('合计乘以该数；留空保存为 0')}
                    </Flex>
                  </>
                )}
              </>
            )}
            <Gap height='5px' />
          </>
        )}

        <Flex alignCenter>
          <Flex alignCenter>{i18next.t('设置列宽')}：</Flex>
          <ColumnWidth
            style={headStyle || {}}
            onChange={this.handleChangeTableColumn}
          />
        </Flex>

        <Gap height='5px' />

        <Flex alignCenter>
          <Flex alignCenter>{i18next.t('设置行高')}：</Flex>
          <input
            value={editStore.computedTableCustomerRowHeight}
            onChange={e => {
              const value = e.target.value
              if (+value <= 100 && +value >= 0)
                editStore.setTableCustomerRowHeight(value)
            }}
            type='number'
            className='gm-printer-edit-input-custom'
          />
          px
        </Flex>
        {showProductPermutation && (
          <>
            <Gap height='5px' />
            {isDeliverType && (
              <>
                <Flex alignCenter>
                  <Flex alignCenter>{i18next.t('商品排列')}：</Flex>
                  <Select
                    className='gm-printer-edit-select'
                    value={editStore.computedTableArrange}
                    onChange={editStore.setTableArrange}
                  >
                    <Option value='lateral'>{i18next.t('横向排列')}</Option>
                    <Option value='vertical'>{i18next.t('纵向排列')}</Option>
                  </Select>
                </Flex>
                <Flex alignCenter className='gm-padding-top-5 gm-text-desc'>
                  {i18next.t('商品排列仅适用于双栏商品设置')}
                </Flex>
              </>
            )}
            {editStore.computedTableArrange === 'vertical' && isDeliverType && (
              <>
                <Gap height='5px' />
                <Flex alignCenter>
                  <Flex alignCenter>{i18next.t('排列样式')}：</Flex>
                  <Select
                    className='gm-printer-edit-select'
                    value={editStore.computedTableVerticalStyle}
                    onChange={editStore.setTableVerticalStyle}
                  >
                    <Option value='leftToRight'>{i18next.t('左右均分')}</Option>
                    <Option value='firstLeftThenRight'>
                      {i18next.t('先左后右')}
                    </Option>
                  </Select>
                </Flex>
                <Flex alignCenter className='gm-padding-top-5 gm-text-desc'>
                  {i18next.t(
                    '选择左右均分时，商品将在先左后右的基础上左右平均分配进行显示，以减少空白单元格的情况。选择先左后右时，商品将先填充左侧单元格，随后填充右侧单元格。'
                  )}
                </Flex>
              </>
            )}
          </>
        )}
        {renderExtra && renderExtra()}
        <Gap height='5px' />
        {type === 'OUT_STOCK' && showMergeOption && (
          <Flex>
            <div>
              <Radio.Group
                options={[
                  {
                    label: i18next.t('不同项合并打印（打印在一行上）'),
                    value: 1
                  },
                  {
                    label: i18next.t('不同项分开打印（分开行打印）'),
                    value: 0
                  }
                ]}
                onChange={editStore.changeIsMergeCustomData}
                value={editStore.isMergeCustomData}
              />
              <Flex alignCenter className='gm-padding-top-5 gm-text-desc'>
                {i18next.t('合并打印设置只针对自定义字段')}
              </Flex>
            </div>
          </Flex>
        )}

        <Gap height='5px' />

        <Flex alignCenter>
          <Flex alignCenter>{i18next.t('表格样式')}：</Flex>
          <Select
            className='gm-printer-edit-select'
            value={editStore.tableCustomStyle}
            onChange={editStore.changeTableCustomStyle}
          >
            <Option value='default'>{i18next.t('默认样式')}</Option>
            <Option value='className0'>{i18next.t('样式一')}</Option>
            <Option value='className1'>{i18next.t('样式二')}</Option>
            <Option value='className2'>{i18next.t('样式三')}</Option>
          </Select>
        </Flex>

        <Gap height='5px' />

        <Flex>
          <Flex>{i18next.t('字段设置')}：</Flex>
          <div>
            <div>
              <Fonter
                style={headStyle || {}}
                onChange={this.handleChangeTable.bind(this, 'headStyle')}
                type='table'
              />
              <Separator />
              <TextAlign
                style={headStyle || {}}
                onChange={this.handleChangeTable.bind(this, 'headStyle')}
              />
              <Gap />

              <Textarea
                value={head}
                placeholder={i18next.t('请输入表头填充内容')}
                onChange={this.handleChangeTable.bind(this, 'head')}
              />
            </div>
            <div>
              <Fonter
                style={style || {}}
                onChange={this.handleChangeTable.bind(this, 'style')}
                type='table'
              />
              <Separator />
              <TextAlign
                style={style || {}}
                onChange={this.handleChangeTable.bind(this, 'style')}
              />
              <Gap />

              <Textarea
                value={text}
                placeholder={i18next.t('请输入内容填充内容')}
                onChange={this.handleChangeTable.bind(this, 'text')}
              />
            </div>
            {(_.includes(text, i18next.t('时间')) ||
              _.includes(text, i18next.t('日期')) ||
              _.includes(text, 'Time') ||
              _.includes(text, 'Date')) && (
              <div>
                <TipInfo
                  text={i18next.t('注：可通过修改“{{}}”中的内容更改时间格式。')}
                />
                {_.map(DiyTimeType, (v, k) => (
                  <TipInfo text={`${k + 1}。${v.text}`} />
                ))}
                <TipInfo
                  text={`${DiyTimeType.length +
                    +1}、指定日期后7天，输入“单据日期：{{addDay(单据日期, 7)}}”；`}
                />
              </div>
            )}
          </div>
        </Flex>
      </div>
    )
  }

  render() {
    const { editStore } = this.props

    let content = null
    if (editStore.computedIsSelectBlock) {
      content = this.renderBlocks()
    } else if (editStore.computedIsSelectTable) {
      content = this.renderTable()
    }
    return content
  }
}

EditorField.propTypes = {
  editStore: PropTypes.object,
  tableDataKeyList: PropTypes.array,
  type: PropTypes.string,
  showMergeOption: PropTypes.bool,
  /** 是否显示商品排列 */
  showProductPermutation: PropTypes.bool,
  renderExtra: PropTypes.func,
  /** 商品横向表白名单字段集合（传入才显示表体类型下拉） */
  tableBodyTypeFields: PropTypes.object,
  isDeliverType: PropTypes.bool
}

export default EditorField
