/* eslint-disable react/prop-types */
import i18next from '../../locales'
import React from 'react'
import PropTypes from 'prop-types'
import { Flex, Option, Select, Switch } from '../components/index'
import {
  Gap,
  Title,
  FieldBtn,
  Textarea,
  TipInfo,
  Fonter,
  Separator,
  TextAlign
} from '../common/component'
import _ from 'lodash'
import { inject, observer } from 'mobx-react'
import { SORTING_DETAIL_SHOW_OPTIONS } from './constants'

@inject('editStore')
@observer
class TableDetailEditor extends React.Component {
  handleDataKeyChange = dataKey => {
    const { editStore } = this.props
    editStore.setPurchaseTableKey(dataKey)
  }

  handleDetailAddField = value => {
    const { editStore } = this.props
    editStore.specialTextAddField('*' + value)
  }

  handleSpecialTextChange = value => {
    const { editStore } = this.props
    editStore.setSpecialText(value)
  }

  handleSpecialStyleChange = value => {
    const { editStore } = this.props
    editStore.setSpecialStyle(value)
  }

  handleSheetUnitSummaryChange = bool => {
    const { editStore } = this.props
    const { dataKey } = this.props.config
    editStore.setSheetUnitSummary(bool, dataKey)
  }

  render() {
    const {
      addFields: { detailFields },
      editStore: {
        config: { isSheetUnitSummary }
      }
    } = this.props
    const {
      dataKey,
      specialConfig: { template_text, style }
    } = this.props.config

    return (
      <div>
        <Title title={i18next.t('设置采购明细')} />
        <Gap />

        <Flex alignCenter className='gm-padding-top-5'>
          <div>{i18next.t('采购明细')}：</div>
          <Select
            className='gm-printer-edit-select'
            value={dataKey}
            onChange={this.handleDataKeyChange}
          >
            {_.map(SORTING_DETAIL_SHOW_OPTIONS, v => (
              <Option key={v.value} value={v.value}>
                {v.text}
              </Option>
            ))}
          </Select>
        </Flex>
        {dataKey !== 'purchase_no_detail' && (
          <>
            <div className='gm-padding-top-5'>
              <div>{i18next.t('添加字段')}：</div>
              <Flex wrap>
                {_.map(detailFields, o => (
                  <FieldBtn
                    key={o.key}
                    name={o.key}
                    onClick={this.handleDetailAddField.bind(this, o.value)}
                  />
                ))}
              </Flex>
            </div>

            <div className='gm-padding-top-5'>
              <div>{i18next.t('字段设置')}：</div>
              <Fonter style={style} onChange={this.handleSpecialStyleChange} />
              <Separator />
              <TextAlign
                style={style}
                onChange={this.handleSpecialStyleChange}
              />
              <Gap />
              <Textarea
                onChange={this.handleSpecialTextChange}
                value={template_text}
                placeholder={i18next.t('请输入明细字段')}
              />
            </div>
            <TipInfo
              text={i18next.t(
                '说明：在字段之间自行设置间隔符号,但谨慎修改{}中的内容,避免出现数据异常'
              )}
            />
          </>
        )}
      </div>
    )
  }
}

@inject('editStore')
@observer
class EditorSpecialTable extends React.Component {
  render() {
    const { editStore } = this.props
    if (!editStore.computedRegionIsTable) return null
    const arr = editStore.selectedRegion.split('.')
    const tableConfig = editStore.config.contents[arr[2]]
    const { specialConfig, dataKey = '' } = tableConfig
    // 双栏时不展示采购明细
    const keyArr = dataKey.split('_')
    const isMultiActive = keyArr.includes('multi')
    if (!specialConfig || isMultiActive) return null
    // 可以编辑明细的table
    return (
      <TableDetailEditor
        config={tableConfig}
        addFields={this.props.addFields}
      />
    )
  }
}

EditorSpecialTable.propTypes = {
  addFields: PropTypes.object.isRequired
}

export default EditorSpecialTable
