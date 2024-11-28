import i18next from '../../locales'
import React from 'react'
import { observer, inject, Observer } from 'mobx-react'
import { Flex, Option, Select, TagSelect } from '../components'
import { InputWithUnit } from '../common/component'
import { pageTypeMap, printDirectionList } from '../config'
import _ from 'lodash'
import { dispatchMsg } from '../util'
import PropTypes from 'prop-types'
import { BATCH_PRINTER_SETTING_TEXT_ENUM } from '../constants'

@inject('editStore')
@observer
class EditorSelector extends React.Component {
  handleConfigName = e => {
    this.props.editStore.setConfigName(e.target.value)
  }

  handlePageType = value => {
    this.props.editStore.setSizePageType(value)
  }

  handlePageSize(field, value) {
    this.props.editStore.setPageSize(field, value)
  }

  handlePrintDirection = value => {
    this.props.editStore.setPagePrintDirection(value)
  }

  handleSelectedRegion = selected => {
    dispatchMsg('gm-printer-select-region', { selected })
  }

  handleSetBatchPrintConfig = type => {
    this.props.editStore.setBatchPrintConfig(type)
  }

  handleTemplateType = type => {
    this.props.editStore.setTemplateType(type)
  }

  handleSetTags = tags => {
    this.props.editStore.setTags(tags)
  }

  render() {
    const {
      config: { name, page, batchPrintConfig, templateType },
      computedRegionList,
      computedSelectedRegionTip,
      selectedRegion,
      templateTags,
      tags
    } = this.props.editStore
    const isDIY = page.type === 'DIY'
    return (
      <div>
        <Flex alignCenter justifyEnd>
          <div>
            {i18next.t('模板名称')}
            {i18next.t('：')}
          </div>
          <input
            className='gm-printer-edit-input-custom'
            type='text'
            value={name}
            onChange={this.handleConfigName}
          />
        </Flex>

        <Flex alignCenter justifyEnd className='gm-padding-top-5'>
          <div>
            {i18next.t('打印规格')}
            {i18next.t('：')}
          </div>
          <Select
            className='gm-printer-edit-select'
            value={page.type}
            onChange={this.handlePageType}
          >
            {_.map(pageTypeMap, (v, k) => (
              <Option key={k} value={k}>
                {v.name}
              </Option>
            ))}
          </Select>
        </Flex>

        {isDIY && (
          <Flex alignCenter justifyEnd className='gm-padding-top-5'>
            <div>
              {i18next.t('纸张宽度')}
              {i18next.t('：')}
            </div>
            <InputWithUnit
              className='gm-printer-edit-input-custom'
              unit='mm'
              value={page.size.width}
              onChange={this.handlePageSize.bind(this, 'width')}
            />
          </Flex>
        )}

        {isDIY && (
          <Flex alignCenter justifyEnd className='gm-padding-top-5'>
            <div>
              {i18next.t('纸张高度')}
              {i18next.t('：')}
            </div>
            <InputWithUnit
              className='gm-printer-edit-input-custom'
              unit='mm'
              value={page.size.height}
              onChange={this.handlePageSize.bind(this, 'height')}
            />
          </Flex>
        )}

        <Flex alignCenter justifyEnd className='gm-padding-top-5'>
          <div>
            {i18next.t('打印布局')}
            {i18next.t('：')}
          </div>
          <Select
            className='gm-printer-edit-select'
            value={page.printDirection}
            onChange={this.handlePrintDirection}
          >
            {_.map(printDirectionList, v => (
              <Option key={v.value} value={v.value}>
                {v.text}
              </Option>
            ))}
          </Select>
        </Flex>

        <Flex alignCenter justifyEnd className='gm-padding-top-5'>
          <div>
            {i18next.t('选择区域')}
            {i18next.t('：')}
          </div>
          <Select
            className='gm-printer-edit-select'
            value={selectedRegion || 'all'}
            onChange={this.handleSelectedRegion}
          >
            {_.map(computedRegionList, v => (
              <Option key={v.value} value={v.value}>
                {v.text}
              </Option>
            ))}
          </Select>
        </Flex>
        {templateTags && (
          <Flex alignCenter justifyEnd className='gm-padding-top-5'>
            <div>
              {i18next.t('编辑标签')}
              {i18next.t('：')}
            </div>
            <Observer>
              {() => (
                <TagSelect
                  isMultiple={false}
                  value={tags}
                  onChange={this.handleSetTags}
                  options={templateTags}
                />
              )}
            </Observer>
          </Flex>
        )}
        {this.props.isPurchase ||
          (this.props.type === 'picking' && (
            <>
              <Flex alignCenter justifyEnd className='gm-padding-top-5'>
                <div>
                  {i18next.t('批量打印设置')}
                  {i18next.t('：')}
                </div>
                <Select
                  className='gm-printer-edit-select'
                  value={batchPrintConfig}
                  onChange={this.handleSetBatchPrintConfig}
                >
                  <Option value={1}>{i18next.t('不连续打印')}</Option>
                  <Option value={2}>{i18next.t('连续打印')}</Option>
                </Select>
              </Flex>
              <div>
                {BATCH_PRINTER_SETTING_TEXT_ENUM[
                  this.props.batchPrintSettingKey
                ]?.map(item => (
                  <p style={{ color: 999, paddingLeft: 24 }} key={item}>
                    {item}
                  </p>
                ))}
              </div>
            </>
          ))}

        {this.props.type === 'picking' && (
          <Flex alignCenter justifyEnd className='gm-padding-top-5'>
            <div>
              {i18next.t('模板类型')}
              {i18next.t('：')}
            </div>
            <Select
              className='gm-printer-edit-select'
              value={templateType}
              onChange={this.handleTemplateType}
            >
              <Option value={1}>{i18next.t('商品分拣单')}</Option>
              <Option value={2}>{i18next.t('客户分拣单')}</Option>
            </Select>
          </Flex>
        )}

        <Flex alignCenter justifyEnd className='gm-padding-top-5 gm-text-red'>
          {computedSelectedRegionTip}
        </Flex>
      </div>
    )
  }
}

EditorSelector.propTypes = {
  isPurchase: PropTypes.bool,
  batchPrintSettingKey: PropTypes.string,
  type: PropTypes.string
}
EditorSelector.deaultProps = {
  isPurchase: false,
  batchPrintSettingKey: 'purchase_by_supplier'
}

export default EditorSelector
