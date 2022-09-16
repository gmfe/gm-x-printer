/*
 * @Description:配送单特殊控制
 */
import i18next from '../../locales'
import { inject, observer } from 'mobx-react'
import PropTypes from 'prop-types'
import React from 'react'
import { Flex, Radio, Switch } from '../components'
import { Title } from './component'

@inject('editStore')
@observer
class EditorSpecialSetting extends React.Component {
  state = {
    value: ''
  }

  componentDidMount() {
    const {
      addFields,
      editStore: { config }
    } = this.props
    const value =
      config.specialSettingType || addFields?.specialFields?.[0]?.value || ''
    this.setState({ value })
  }

  /** 切换特殊设置 */
  handleToggleSpecialSetting = e => {
    const { editStore } = this.props
    editStore.toggleIsSpecialSetting(e ? this.state.value : '')
  }

  handleChange = e => {
    const val = e.target.value
    const value = isNaN(Number(val)) ? val : Number(val)
    this.setState({ value }, () => {
      this.handleToggleSpecialSetting(value)
    })
  }

  render() {
    const {
      editStore: { config },
      addFields
    } = this.props
    const specialFields = addFields.specialFields || []

    return (
      <>
        <Title title={i18next.t('配送单特殊配置')} />
        <Flex alignCenter className='gm-padding-top-5'>
          <div>{i18next.t('是否启用特殊配置')}：</div>

          <Switch
            checked={!!config.specialSettingType}
            onChange={this.handleToggleSpecialSetting}
          />
        </Flex>
        {!!config.specialSettingType && (
          <Flex alignCenter column className='gm-padding-top-5'>
            <Radio.Group
              options={specialFields}
              onChange={this.handleChange}
              value={this.state.value}
            />
          </Flex>
        )}
      </>
    )
  }
}

EditorSpecialSetting.propTypes = {
  editStore: PropTypes.object,
  addFields: PropTypes.object.isRequired
}

export default EditorSpecialSetting
