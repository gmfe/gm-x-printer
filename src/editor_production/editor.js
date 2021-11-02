import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { Flex } from '../components'
import { Gap, Title } from '../common/component'
import editStore from './store'
import { observer, inject } from 'mobx-react'
import EditorTitle from '../common/editor_title'
import EditorSelect from '../common/editor_select'
import EditTemplateType from '../common/edit_template_type'
import EditorField from '../common/editor_edit_field'
import EditorAddField from '../common/editor_add_field'
import ContextMenu from './context_menu'
import i18next from '../../locales'
import withStore from '../common/hoc_with_store'

@withStore(editStore)
@inject('editStore')
@observer
class Editor extends React.Component {
  render() {
    const {
      onSave,
      showEditor,
      addFields,
      config: { productionMergeType, templateType }
    } = this.props
    // 不同的生产单据，显示的数据类型不同
    let tableDataKeyList = [
      ['1', '3'].includes(productionMergeType) && {
        value: '1',
        text: i18next.t('物料聚合')
      },
      productionMergeType === '2' && {
        value: '2',
        text: i18next.t('生产成品聚合')
      },
      ['1', '2', '3'].includes(productionMergeType) && {
        value: '3',
        text: i18next.t('工序聚合')
      },
      productionMergeType === '4' && {
        value: '4',
        text: i18next.t('包装聚合')
      }
    ]
    tableDataKeyList = _.filter(tableDataKeyList, item => item)
    return (
      <div className='gm-printer-edit'>
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
        {showEditor && (
          <div className='gm-printer-edit-zone'>
            <EditorTitle onSave={onSave} />
            <Gap height='10px' />
            <EditTemplateType
              tip={i18next.t(
                '表示该模板是针对净菜单据、熟食单据、或者是包装单据的模板。'
              )}
              bill={templateType}
            />
            <Gap height='5px' />
            <EditorSelect />
            <Gap height='5px' />
            <EditorField tableDataKeyList={tableDataKeyList} />
            <Gap height='5px' />
            <EditorAddField addFields={addFields} />

            <div id='gm-printer-tip' />

            <div id='gm-printer-modal' />
          </div>
        )}

        <div className='gm-printer-edit-wrap'>
          <ContextMenu />
        </div>
      </div>
    )
  }
}

Editor.propTypes = {
  config: PropTypes.object.isRequired,
  onSave: PropTypes.func,
  showEditor: PropTypes.bool,
  mockData: PropTypes.object.isRequired,
  addFields: PropTypes.object.isRequired
}

Editor.deaultProps = {
  onSave: _.noop
}

export default Editor
