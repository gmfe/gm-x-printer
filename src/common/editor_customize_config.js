import _ from 'lodash'
import { getAutoFillingConfig } from '../util'
import i18next from '../../locales'
import { inject, observer } from 'mobx-react'
import PropTypes from 'prop-types'
import React from 'react'
import { Flex, Option, Select, Switch } from '../components'

const AutoFillingMap = {
  // 不填充
  manual: '不填充',
  // 填充空白行
  empty: '填充空白行',
  // 填充空白行并展示序号
  number: '填充空白行并展示序号'
}

@inject('editStore')
@observer
class EditorCutomizedConfig extends React.Component {
  handleAutoFilling = value => {
    const { editStore } = this.props
    editStore.handleChangeTableData(value)
  }

  render() {
    const {
      editStore,
      isDeliverType,
      editStore: { isAutoFilling, linesPerPage }
    } = this.props
    // 是table
    if (editStore.computedRegionIsTable) {
      return (
        <>
          {isDeliverType && (
            <Flex alignCenter className='gm-padding-top-5'>
              <div>{i18next.t('每页行数')}：</div>
              <input
                value={linesPerPage}
                onChange={e => editStore.setLinesPerPage(e.target.value, true)}
                className='gm-printer-edit-input-custom'
                type='number'
              />
            </Flex>
          )}
          <Flex alignCenter className='gm-padding-top-5'>
            <div>{i18next.t('自动填充行数')}：</div>
            {isDeliverType ? (
              <Select
                className='gm-printer-edit-select'
                value={getAutoFillingConfig(isAutoFilling)}
                onChange={this.handleAutoFilling}
              >
                {_.map(AutoFillingMap, (v, k) => (
                  <Option key={k} value={k}>
                    {v}
                  </Option>
                ))}
              </Select>
            ) : (
              <Switch
                checked={isAutoFilling}
                onChange={this.handleAutoFilling}
              />
            )}
          </Flex>
          {!isDeliverType && (
            <Flex className='gm-padding-top-5 gm-text-red' column>
              {i18next.t('注意：填充仅支持单栏数据使用')}
            </Flex>
          )}
        </>
      )
    } else {
      return null
    }
  }
}

EditorCutomizedConfig.propTypes = {
  editStore: PropTypes.object,
  extraSpecialConfig: PropTypes.object,
  isDeliverType: PropTypes.bool
}

export default EditorCutomizedConfig
