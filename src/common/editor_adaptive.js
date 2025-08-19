/*
 * @Description:自适应
 */
import i18next from '../../locales'
import { inject, observer } from 'mobx-react'
import PropTypes from 'prop-types'
import React from 'react'
import { Flex, Switch } from '../components'

@inject('editStore')
@observer
class EditorAdaptive extends React.Component {
  /** 切换自适应 */
  handleToggleAdaptive = () => {
    const { editStore } = this.props
    editStore.toggleIsAdaptive()
  }

  /** 切换自适应 */
  handleToggleFooterAdaptive = () => {
    const { editStore } = this.props
    editStore.toggleIsFooterAdaptive()
  }

  render() {
    const {
      editStore: { config }
    } = this.props
    return (
      <>
        <Flex alignCenter className='gm-padding-top-5'>
          <div>{i18next.t('签名区域自适应内容')}：</div>
          <Switch
            checked={config?.sign?.isAdaptive}
            onChange={this.handleToggleAdaptive}
          />
        </Flex>
        <Flex className='gm-padding-top-5 gm-text-red' column>
          {i18next.t(
            '注意：开启后签名区域内容会紧跟内容区域，不会一直固定在底部'
          )}
        </Flex>
        <Flex alignCenter className='gm-padding-top-5'>
          <div>{i18next.t('页脚区域自适应内容')}：</div>
          <Switch
            checked={config?.footer?.isAdaptive}
            onChange={this.handleToggleFooterAdaptive}
          />
        </Flex>
        <Flex className='gm-padding-top-5 gm-text-red' column>
          {i18next.t(
            '注意：开启后页脚区域内容会紧跟内容区域，不会一直固定在底部'
          )}
        </Flex>
      </>
    )
  }
}

EditorAdaptive.propTypes = {
  editStore: PropTypes.object
}

export default EditorAdaptive
