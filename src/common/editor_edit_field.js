import i18next from '../../locales'
import React from 'react'
import { Flex, Option, Select, Radio } from '../components'
import { observer, inject } from 'mobx-react'
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
  Border,
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
          type === 'qrcode_trace' ) && (
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
          </div>
        )}
      </div>
    )
  }

  renderTable() {
    const { tableDataKeyList, editStore, type, showMergeOption } = this.props
    const { head, headStyle, text, style } =
      editStore.computedSelectedInfo || {}
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

        <Flex alignCenter>
          <Flex alignCenter>{i18next.t('设置列宽')}：</Flex>
          <ColumnWidth
            style={headStyle}
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

        <Gap height='5px' />

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
                style={headStyle}
                onChange={this.handleChangeTable.bind(this, 'headStyle')}
                type='table'
              />
              <Separator />
              <TextAlign
                style={headStyle}
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
                style={style}
                onChange={this.handleChangeTable.bind(this, 'style')}
                type='table'
              />
              <Separator />
              <TextAlign
                style={style}
                onChange={this.handleChangeTable.bind(this, 'style')}
              />
              <Gap />

              <Textarea
                value={text}
                placeholder={i18next.t('请输入内容填充内容')}
                onChange={this.handleChangeTable.bind(this, 'text')}
              />
            </div>
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
  showMergeOption: PropTypes.bool
}

export default EditorField
