import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { Flex } from '../components'
import { Gap, Title } from '../common/component'
import editStore from './store'
import { observer, inject } from 'mobx-react'
import EditorTitle from '../common/editor_title'
import EditorSelect from '../common/editor_select'
import EditorField from '../common/editor_edit_field'
import EditorAddField from '../common/editor_add_field'
import ContextMenu from './context_menu'
import i18next from '../../locales'
import withStore from '../common/hoc_with_store'
import { TABLE_TYPE } from './table_type'

const tableDataKeyList = [
  { value: TABLE_TYPE.ORDERS, text: i18next.t('账单明细') },
  { value: TABLE_TYPE.SKUS, text: i18next.t('订单明细') },
  { value: TABLE_TYPE.PRODUCT, text: i18next.t('商品汇总') },
  { value: TABLE_TYPE.TYPE, text: i18next.t('分类汇总') },
  { value: TABLE_TYPE.ORDER_TYPE, text: i18next.t('订单类型') }
]

@withStore(editStore)
@inject('editStore')
@observer
class Editor extends React.Component {
  /**
   * 当前选择的“数据展示”
   */
  get currentTableDataKey() {
    return this.props.editStore.computedTableDataKeyOfSelectedRegion
  }

  /**
   * addFields 根据 currentTableDataKey 的值变化
   */
  get currentAddFields() {
    const { tableFieldsGrouped, addFields } = this.props
    const { currentTableDataKey } = this
    if (_.has(tableFieldsGrouped, currentTableDataKey)) {
      const tableFields = {}
      _.forEach(tableFieldsGrouped[currentTableDataKey], item => {
        const fields = addFields.tableFields[item]
        if (!_.isEmpty(fields)) {
          tableFields[item] = addFields.tableFields[item]
        }
      })
      return {
        ...addFields,
        tableFields
      }
    }
    return addFields
  }

  render() {
    const { onSave, showEditor, uploadQiniuImage } = this.props
    const { currentAddFields } = this

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
            <EditorSelect />
            <Gap height='5px' />
            <EditorField tableDataKeyList={tableDataKeyList} />
            <Gap height='5px' />
            <EditorAddField addFields={currentAddFields} />

            <div id='gm-printer-tip' />

            <div id='gm-printer-modal' />
          </div>
        )}

        <div className='gm-printer-edit-wrap'>
          <ContextMenu uploadQiniuImage={uploadQiniuImage} />
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
  tableFieldsGrouped: PropTypes.object,
  editStore: PropTypes.object
}

Editor.deaultProps = {
  onSave: _.noop
}

export default Editor
