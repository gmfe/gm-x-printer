import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { Flex } from '../components'
import { Gap, Title } from '../common/component'
import EditStore from './store'
import { observer, inject } from 'mobx-react'
import EditorTitle from '../common/editor_title'
import EditorSelect from '../common/editor_select'
import EditorField from '../common/editor_edit_field'
import EditorAddField from '../common/editor_add_field'
import EditorSubtotal from '../common/editor_subtotal'
import ContextMenu from './context_menu'
import i18next from '../../locales'
import withStore from '../common/hoc_with_store'
import classNames from 'classnames'
import EditorAdaptive from '../common/editor_adaptive'

const tableDataKeyList = [{ value: 'orders', text: i18next.t('全部商品') }]

/** 单例导致出问题，这里改成工厂模式，withStore 也要改一下 */
@withStore(() => new EditStore())
@inject('editStore')
@observer
class Editor extends React.Component {
  render() {
    const {
      onSave,
      showEditor,
      addFields,
      className,
      uploadQiniuImage,
      type,
      templateType
    } = this.props
    return (
      <div className={classNames('gm-printer-edit', className)}>
        <Flex className='gm-printer-edit-title-fixed'>
          <Title
            title={i18next.t('模板预览')}
            text={
              <span className='gm-text-desc gm-padding-left-5'>
                {i18next.t(
                  '说明：选中内容进行编辑，可拖动字段移动位置，右键使用更多功能'
                )}
              </span>
            }
          />
        </Flex>
        <div style={{ display: 'none' }}>
          {this.props?.editStore?.config?.templateType}
        </div>

        {showEditor && (
          <div className='gm-printer-edit-zone'>
            <EditorTitle onSave={onSave} />
            <Gap height='10px' />
            <EditorSelect type={type} />
            <Gap height='5px' />
            <EditorField tableDataKeyList={tableDataKeyList} />
            <Gap height='5px' />
            {typeof addFields === 'function' ? (
              <EditorAddField
                addFields={addFields(this?.props?.editStore?.config)}
              />
            ) : (
              <EditorAddField addFields={addFields} />
            )}
            {/* 自适应页面内容开关 */}
            <EditorAdaptive />
            <EditorSubtotal templateType={templateType} />

            <div id='gm-printer-tip' />

            <div id='gm-printer-modal' />
          </div>
        )}

        <div className='gm-printer-edit-wrap'>
          <ContextMenu
            type={type}
            templateType={templateType}
            uploadQiniuImage={uploadQiniuImage}
          />
        </div>
      </div>
    )
  }
}

Editor.propTypes = {
  config: PropTypes.object.isRequired,
  onSave: PropTypes.func,
  uploadQiniuImage: PropTypes.func,
  showEditor: PropTypes.bool,
  mockData: PropTypes.object.isRequired,
  addFields: PropTypes.object.isRequired,
  type: PropTypes.string,
  editStore: PropTypes.object,
  templateType: PropTypes.number
}

Editor.deaultProps = {
  onSave: _.noop
}

export default Editor
