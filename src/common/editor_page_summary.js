/* eslint-disable import/named */
import React from 'react'
import {
  Fonter,
  Separator,
  TextAlign,
  Title,
  IsShowCheckBox,
  ShowInputText
} from './component'
import i18next from '../../locales'
import _ from 'lodash'
import { has, get } from 'mobx'
import { Flex, Switch, Select, Option } from '../components'
import { inject, Observer, observer } from 'mobx-react'
import PropTypes from 'prop-types'
import {
  TEMPLATE_SHOW_STYLE_LIST,
  SORT_BY_BIG_OR_SMALL,
  STYLE_ENUM,
  SHOW_ENUM,
  CHOSE_FIELD_ENUM,
  SHOW_WAY_ENUM,
  PAGE_TEXT,
  SHOW_ORDER_CASE_ENUM,
  SHOW_PAGE_CASE_ENUM,
  COM_STYLE,
  PAGE_CHECKBOX
} from '../config'

const desc_bottom = (
  <div style={{ ...COM_STYLE }}>所选择的字段必须是在列表中有配置的才能显示</div>
)
const desc_row = (
  <div style={{ marginLeft: 84, ...COM_STYLE }}>
    整行展现的情况下只能选择一个字段
  </div>
)

@inject('editStore')
@observer
class SummarySetting extends React.Component {
  setSummaryConfig = obj => {
    this.props.editStore.setSummaryConfig(obj)
  }

  setOrderSummaryConfig = obj => {
    this.props.editStore.setOrderSummaryConfig(obj)
  }

  // 每页合计开关
  handlePageSummaryShow = pageSummaryShow => {
    this.setSummaryConfig({ pageSummaryShow })
  }

  // size/textAlign 样式改变
  handleStyle = (type, style) => {
    this.props.editStore.changeUpdateData()
    if (type === STYLE_ENUM.page_bottom_style) {
      this.setSummaryConfig({ style })
    } else {
      this.setOrderSummaryConfig({ style })
    }
  }

  /**
   *
   * @param {*} type 每页合计/整单合计所选字段
   * @param {*} e event
   */
  handlePageSummaryColumns = (type, e) => {
    const { editStore } = this.props
    const {
      summaryConfig,
      allOrderSummaryConfig
    } = editStore.computedTableSpecialConfig
    const id = e.target.id
    editStore.changeUpdateData()
    if (type === CHOSE_FIELD_ENUM.page_chose_field) {
      // 由于初始模板没有summary 这个object，为了UI响应数据，只能这么写了
      const hasSummaryConfig = has(
        editStore.computedTableSpecialConfig,
        'summaryConfig'
      )
      const oldSummaryColumns =
        (hasSummaryConfig && summaryConfig.summaryColumns.slice()) || []
      const newSummaryColumns = _.xor(oldSummaryColumns, [id])
      this.setSummaryConfig({ summaryColumns: newSummaryColumns })
    } else {
      const hasAllOrderSummaryConfig = has(
        editStore.computedTableSpecialConfig,
        'allOrderSummaryConfig'
      )
      const oldOrderSummaryColumns =
        (hasAllOrderSummaryConfig &&
          allOrderSummaryConfig.summaryOrderColumns.slice()) ||
        []
      const newOrderSummaryColumns = _.xor(oldOrderSummaryColumns, [id])
      this.setOrderSummaryConfig({
        summaryOrderColumns: newOrderSummaryColumns
      })
    }
  }

  // 选择汇总字段——每页合计——整行展现
  handleSelectPageSummaryColumns = (type, value) => {
    this.props.editStore.changeChoseSummaryField(type, value)
  }

  renderPageSummary = () => {
    const { editStore, orderPerSummaryFields } = this.props
    const newSummaryFields = orderPerSummaryFields.filter(
      item => item.type !== 'select'
    )
    const { summaryConfig, subtotal } =
      editStore?.computedTableSpecialConfig ?? {}
    const {
      showPageType,
      fields,
      pageFontSort,
      pageSummaryText,
      pageLowerCaseText,
      pageUpperCaseText
    } = summaryConfig
    // 由于初始末班没有summary 这个object，为了UI响应数据，只能这么写了
    const hasSummaryConfig = has(
      editStore.computedTableSpecialConfig,
      'summaryConfig'
    )
    const summaryStyle = (hasSummaryConfig && summaryConfig.style) || {}
    const summaryColumns =
      (hasSummaryConfig && summaryConfig.summaryColumns) || []
    const pageSummaryShow =
      (hasSummaryConfig && summaryConfig.pageSummaryShow) || false

    //  每页合计是否小写
    const subtotalNeedLowerCase =
      (editStore.computedTableSpecialConfig?.subtotal &&
        get(subtotal, SHOW_PAGE_CASE_ENUM.needLowerCase)) ||
      false
    //  每页合计是否大写
    const subtotalNeedUpperCase =
      (editStore.computedTableSpecialConfig?.subtotal &&
        get(subtotal, SHOW_PAGE_CASE_ENUM.needUpperCase)) ||
      false
    return (
      <>
        <Title title={PAGE_TEXT} />
        <Flex alignCenter className='gm-padding-top-5'>
          <div>{PAGE_TEXT}：</div>
          <Switch
            checked={pageSummaryShow}
            onChange={this.handlePageSummaryShow}
          />
        </Flex>

        {pageSummaryShow && (
          <>
            <Flex alignCenter className='gm-padding-top-5'>
              <div>{i18next.t('展现样式')}：</div>
              <Select
                className='gm-printer-edit-select'
                value={showPageType}
                onChange={value =>
                  this.handleShowStyle(SHOW_ENUM.pageSummary, value)
                }
              >
                {_.map(TEMPLATE_SHOW_STYLE_LIST, v => (
                  <Option key={v.value} value={v.value}>
                    {v.text}
                  </Option>
                ))}
              </Select>
            </Flex>

            {showPageType === SHOW_WAY_ENUM.bottom ? (
              <ShowInputText
                value={pageSummaryText}
                onChange={this.handleSumName}
                type='page_total'
                text='合计'
              />
            ) : (
              <>
                <Flex className='gm-padding-top-5'>
                  <Flex alignCenter>选择汇总字段：</Flex>
                  <Select
                    className='gm-printer-edit-select'
                    value={fields?.[0].name ?? '{{列.商品销售额}}'}
                    onChange={value => {
                      this.handleSelectPageSummaryColumns(
                        'chose_page_summary_field',
                        value
                      )
                    }}
                  >
                    {_.map(newSummaryFields, v => (
                      <Option key={v.value} value={v.value}>
                        {v.key}
                      </Option>
                    ))}
                  </Select>
                </Flex>
                {desc_row}
              </>
            )}

            <Flex className='gm-padding-top-5'>
              <Flex>样式设置：</Flex>
              <Fonter
                style={summaryStyle}
                onChange={style =>
                  this.handleStyle(STYLE_ENUM.page_bottom_style, style)
                }
              />
              <Separator />
              <TextAlign
                style={summaryStyle}
                onChange={style =>
                  this.handleStyle(STYLE_ENUM.page_bottom_style, style)
                }
              />
            </Flex>

            {showPageType === SHOW_WAY_ENUM.row && (
              <>
                <IsShowCheckBox
                  checked={subtotalNeedLowerCase}
                  onChange={() => editStore.setSubtotalLowerCase(PAGE_CHECKBOX)}
                  type='text_small'
                />
                <ShowInputText
                  value={pageLowerCaseText}
                  onChange={this.handleSumName}
                  type='page_small'
                  text='*小写*'
                />

                <IsShowCheckBox
                  checked={subtotalNeedUpperCase}
                  onChange={() => editStore.setSubtotalUpperCase(PAGE_CHECKBOX)}
                  type='text_big'
                />
                <ShowInputText
                  value={pageUpperCaseText}
                  onChange={this.handleSumName}
                  type='page_big'
                  text='*大写*'
                />
                <ShowInputText
                  value={pageSummaryText}
                  onChange={this.handleSumName}
                  type='page_total'
                  text={PAGE_TEXT}
                />
                <Flex className='gm-padding-top-5'>
                  <Flex alignCenter>顺序：</Flex>
                  <Select
                    className='gm-printer-edit-select'
                    value={pageFontSort}
                    onChange={value =>
                      this.handleSortBigOrSmall('page_font_sort', value)
                    }
                  >
                    {_.map(SORT_BY_BIG_OR_SMALL, v => (
                      <Option key={v.value} value={v.value}>
                        {v.text}
                      </Option>
                    ))}
                  </Select>
                </Flex>
              </>
            )}

            {showPageType === SHOW_WAY_ENUM.bottom && (
              <div className='gm-padding-top-5'>
                <Flex alignCenter>选择汇总字段：</Flex>
                {desc_bottom}
                <Flex wrap>
                  {orderPerSummaryFields.map(o => (
                    <label
                      htmlFor={o.value}
                      style={{ width: '50%' }}
                      key={o.value}
                    >
                      <input
                        type='checkbox'
                        id={o.value}
                        checked={summaryColumns.includes(o.value)}
                        onChange={e =>
                          this.handlePageSummaryColumns(
                            CHOSE_FIELD_ENUM.page_chose_field,
                            e
                          )
                        }
                      />
                      &nbsp;{o.key}
                    </label>
                  ))}
                </Flex>
              </div>
            )}
          </>
        )}
      </>
    )
  }

  renderOrderSummary = () => {
    const { editStore, orderPerSummaryFields, hideAllOrderSummary } = this.props
    const newSummaryFields = orderPerSummaryFields.filter(
      item => item.type !== 'select'
    )
    const {
      allOrderSummaryConfig,
      // 分单打印时显示总单合计
      allOrderSummaryShow,
      // 是否每页显示总单合计
      isShowAllOrderSummaryPer,
      allOrderSummaryText,
      subtotal
    } = editStore.computedTableSpecialConfig
    const {
      orderSummaryShow,
      showOrderType,
      fields,
      orderUpperCaseText,
      summaryOrderColumns,
      orderFontSort,
      orderSummaryText,
      orderLowerCaseText,
      isShowOrderSummaryPer
    } = allOrderSummaryConfig
    // 由于初始末班没有summary 这个object，为了UI响应数据，只能这么写了
    const hasAllOrderSummaryConfig = has(
      editStore.computedTableSpecialConfig,
      'allOrderSummaryConfig'
    )
    const orderSummaryStyle =
      (hasAllOrderSummaryConfig && allOrderSummaryConfig.style) || {}
    //  整单合计是否小写
    const order_subtotalNeedLowerCase =
      (editStore.computedTableSpecialConfig?.subtotal &&
        get(subtotal, SHOW_ORDER_CASE_ENUM.order_needLowerCase)) ||
      false
    //  整单合计是否大写
    const order_subtotalNeedUpperCase =
      (editStore.computedTableSpecialConfig?.subtotal &&
        get(subtotal, SHOW_ORDER_CASE_ENUM.order_needUpperCase)) ||
      false

    return (
      <>
        <Title title='整单合计' />
        <Flex alignCenter className='gm-padding-top-5'>
          <div>{i18next.t('整单合计')}：</div>
          <Switch
            checked={orderSummaryShow}
            onChange={this.handleOrderPageSummaryShow}
          />
        </Flex>

        {orderSummaryShow && (
          <>
            <Flex alignCenter className='gm-padding-top-5'>
              <div>{i18next.t('是否每页显示整单合计')}：</div>
              <Switch
                checked={isShowOrderSummaryPer}
                onChange={this.handleIsShowPerOrderSummary}
              />
            </Flex>
            <Flex alignCenter className='gm-padding-top-5'>
              <div>{i18next.t('展现样式')}：</div>
              <Select
                className='gm-printer-edit-select'
                value={showOrderType}
                onChange={value =>
                  this.handleShowStyle(SHOW_ENUM.orderSumary, value)
                }
              >
                {_.map(TEMPLATE_SHOW_STYLE_LIST, v => (
                  <Option key={v.value} value={v.value}>
                    {v.text}
                  </Option>
                ))}
              </Select>
            </Flex>

            {showOrderType === SHOW_WAY_ENUM.bottom ? (
              <ShowInputText
                value={orderSummaryText}
                onChange={this.handleSumName}
                type='order_total'
                text='合计'
              />
            ) : (
              <>
                <Flex className='gm-padding-top-5'>
                  <Flex alignCenter>选择汇总字段：</Flex>
                  <Select
                    className='gm-printer-edit-select'
                    value={fields?.[0].name ?? '{{列.商品销售额}}'}
                    onChange={value =>
                      this.handleSelectPageSummaryColumns(
                        'chose_order_summary_field',
                        value
                      )
                    }
                  >
                    {_.map(newSummaryFields, v => (
                      <Option key={v.value} value={v.value}>
                        {v.key}
                      </Option>
                    ))}
                  </Select>
                </Flex>
                {desc_row}
              </>
            )}

            <Flex className='gm-padding-top-5'>
              <Flex>样式设置：</Flex>
              <Fonter
                style={orderSummaryStyle}
                onChange={style =>
                  this.handleStyle(STYLE_ENUM.order_row_style, style)
                }
              />
              <Separator />
              <TextAlign
                style={orderSummaryStyle}
                onChange={style =>
                  this.handleStyle(STYLE_ENUM.order_row_style, style)
                }
              />
            </Flex>

            {showOrderType === SHOW_WAY_ENUM.row && (
              <>
                <IsShowCheckBox
                  checked={order_subtotalNeedLowerCase ?? true}
                  onChange={() =>
                    editStore.setSubtotalLowerCase('order_checkbox')
                  }
                  type='text_small'
                />
                <ShowInputText
                  value={orderLowerCaseText}
                  onChange={this.handleSumName}
                  type='order_small'
                  text='*小写*'
                />

                <IsShowCheckBox
                  checked={order_subtotalNeedUpperCase ?? true}
                  onChange={() =>
                    editStore.setSubtotalUpperCase('order_checkbox')
                  }
                  type='text_big'
                />
                <ShowInputText
                  value={orderUpperCaseText}
                  onChange={this.handleSumName}
                  type='order_big'
                  text='*大写*'
                />
                <ShowInputText
                  value={orderSummaryText}
                  onChange={this.handleSumName}
                  type='order_total'
                  text='整单合计'
                />
                <Flex className='gm-padding-top-5'>
                  <Flex alignCenter>顺序：</Flex>
                  <Select
                    className='gm-printer-edit-select'
                    value={orderFontSort}
                    onChange={value =>
                      this.handleSortBigOrSmall('orderType', value)
                    }
                  >
                    {_.map(SORT_BY_BIG_OR_SMALL, v => (
                      <Option key={v.value} value={v.value}>
                        {v.text}
                      </Option>
                    ))}
                  </Select>
                </Flex>
              </>
            )}

            {showOrderType === SHOW_WAY_ENUM.bottom && (
              <div className='gm-padding-top-5'>
                <Flex alignCenter>选择汇总字段：</Flex>
                {desc_bottom}
                <Flex wrap>
                  {orderPerSummaryFields.map(o => (
                    <label
                      htmlFor={o.value + '_order'}
                      style={{ width: '50%' }}
                      key={o.value}
                    >
                      <input
                        type='checkbox'
                        id={o.value + '_order'}
                        checked={summaryOrderColumns.find(item =>
                          item.includes(o.value)
                        )}
                        onChange={e =>
                          this.handlePageSummaryColumns(
                            CHOSE_FIELD_ENUM.order_chose_field,
                            e
                          )
                        }
                      />
                      &nbsp;{o.key}
                    </label>
                  ))}
                </Flex>
              </div>
            )}
          </>
        )}
        {!hideAllOrderSummary && (
          <Observer>
            {() => (
              <Flex alignCenter className='gm-padding-top-5'>
                <div>{i18next.t('分单打印时显示总单合计')}：</div>
                <Switch
                  checked={allOrderSummaryShow}
                  onChange={this.handleAllOrderSummaryShow}
                />
              </Flex>
            )}
          </Observer>
        )}

        <Observer>
          {() =>
            allOrderSummaryShow ? (
              <Flex alignCenter className='gm-padding-top-5'>
                <div>{i18next.t('是否每页显示总单合计')}：</div>
                <Switch
                  checked={isShowAllOrderSummaryPer}
                  onChange={this.handleIsShowAllOrderSummaryPer}
                />
              </Flex>
            ) : (
              <></>
            )
          }
        </Observer>

        <Observer>
          {() =>
            allOrderSummaryShow ? (
              <ShowInputText
                value={allOrderSummaryText}
                onChange={this.handleSumName}
                type='all_order_summary_text'
                text='总单合计'
              />
            ) : (
              <></>
            )
          }
        </Observer>
      </>
    )
  }

  // 选择展现样式
  handleShowStyle = (type, value) => {
    this.props.editStore.changeShowStyle(type, value)
  }

  // 选择汇总字段
  handleChoseSummaryField = value => {
    this.props.editStore.changeChoseSummaryField(value)
  }

  // 大小写前后排序
  handleSortBigOrSmall = (type, value) => {
    this.props.editStore.changeSortBigOrSmall(type, value)
  }

  /**
   * TODO: 改变文案名字
   * @param {*} type （每页/整单合计的大小写、合计文案）
   * @param {*} e event
   */
  handleSumName = (type, e) => {
    this.props.editStore.changeSumName(type, e.target.value)
  }

  // 整单合计开关
  handleOrderPageSummaryShow = orderSummaryShow => {
    this.props.editStore.changeUpdateData()
    this.setOrderSummaryConfig({ orderSummaryShow })
  }

  handleIsShowPerOrderSummary = isShowOrderSummaryPer => {
    this.props.editStore.changeUpdateData()
    this.setOrderSummaryConfig({ isShowOrderSummaryPer })
  }

  handleAllOrderSummaryShow = allOrderSummaryShow => {
    this.props.editStore.changeAllOrderSummaryShow(allOrderSummaryShow)
  }

  handleIsShowAllOrderSummaryPer = isShowAllOrderSummaryPer => {
    this.props.editStore.changeIsShowAllOrderSummaryPer(
      isShowAllOrderSummaryPer
    )
  }

  render() {
    const { hideOrderSummary, hidePageSummary } = this.props
    return (
      <div>
        {/* 每页合计 */}
        {!hidePageSummary && this.renderPageSummary()}
        <div style={{ height: 5, width: '100%' }} />
        {/* 整单合计 */}
        {!hideOrderSummary && this.renderOrderSummary()}
      </div>
    )
  }
}

SummarySetting.propTypes = {
  editStore: PropTypes.object,
  orderPerSummaryFields: PropTypes.array.isRequired,
  /** 是否隐藏 “整单合计” */
  hidePageSummary: PropTypes.bool,
  /** 是否隐藏 “每页合计” */
  hideOrderSummary: PropTypes.bool,
  /** 是否隐藏 “总单合计” */
  hideAllOrderSummary: PropTypes.bool
}

@inject('editStore')
@observer
class EditorSummary extends React.Component {
  render() {
    const {
      editStore,
      orderPerSummaryFields,
      hideOrderSummary,
      hidePageSummary,
      hideAllOrderSummary
    } = this.props
    if (editStore.computedRegionIsTable) {
      return (
        <SummarySetting
          orderPerSummaryFields={orderPerSummaryFields}
          hideOrderSummary={hideOrderSummary}
          hidePageSummary={hidePageSummary}
          hideAllOrderSummary={hideAllOrderSummary}
        />
      )
    } else {
      return null
    }
  }
}

EditorSummary.propTypes = {
  editStore: PropTypes.object,
  orderPerSummaryFields: PropTypes.array.isRequired,
  /** 是否隐藏 “整单合计” */
  hideOrderSummary: PropTypes.bool,
  /** 是否隐藏 “每页合计” */
  hidePageSummary: PropTypes.bool,
  /** 是否隐藏 “总单合计” */
  hideAllOrderSummary: PropTypes.bool
}

export default EditorSummary
