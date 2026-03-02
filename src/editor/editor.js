import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { Flex, Switch } from '../components'
import { Gap, Title } from '../common/component'
import editStore from './store'
import { observer, inject, Observer } from 'mobx-react'
import EditorTitle from '../common/editor_title'
import EditorSelect from '../common/editor_select'
import EditorField from '../common/editor_edit_field'
import EditorAddField from '../common/editor_add_field'
import EditorPageSummary from '../common/editor_page_summary'
import EditTemplateType from '../common/edit_template_type'
import EditorCutomizedConfig from '../common/editor_customize_config'
import EditorAdaptive from '../common/editor_adaptive'
import EditorSpacialSetting from '../common/editor_spacial_setting'
import ContextMenu from './context_menu'
import i18next from '../../locales'
import withStore from '../common/hoc_with_store'
import classNames from 'classnames'

// ‼️‼️🚸🚸 注意: value的命名不要用下划线! 原因是 computedTableDataKeyOfSelectedRegion 会split('_')下划线做一些事情‼️
// 📚hasSubtotalBtn 这种表格是否支持  双栏,分类,合计  功能
const tableDataKeyList = [
  {
    value: 'orders',
    text: i18next.t('非组合/子商品'),
    hasSubtotalBtn: true
  },
  // { value: 'abnormal', text: i18next.t('异常商品'), hasSubtotalBtn: false },
  // {
  //   value: 'abnormalDetails',
  //   text: i18next.t('异常商品(明细)'),
  //   hasSubtotalBtn: false
  // }
  {
    value: 'afterSale',
    text: i18next.t('售后商品'),
    hasSubtotalBtn: false
  },
  {
    value: 'combination',
    text: i18next.t('组合/非组合商品'),
    hasSubtotalBtn: false
  },

  { value: 'allprod', text: i18next.t('全部商品'), hasSubtotalBtn: false }
]

export const noSubtotalBtnTableDataKeySet = new Set(
  tableDataKeyList.filter(v => !v.hasSubtotalBtn).map(o => o.value)
)

@withStore(editStore)
@inject('editStore')
@observer
class Editor extends React.Component {
  render() {
    const {
      onSave,
      showEditor,
      addFields,
      className,
      showNewDate,
      isDeliverType,
      editStore,
      config: { templateType = i18next.t('商户模板') },
      uploadQiniuImage
    } = this.props

    console.log('link成功link成功link成功link成功link成功link成功link成功')
    return (
      <div className={classNames('gm-printer-edit', className)}>
        <Flex className='gm-printer-edit-title-fixed'>
          <Title
            title={i18next.t('模板预览13131231')}
            text={
              <span className='gm-text-desc gm-padding-left-5'>
                {i18next.t(
                  '说明：选中内容进行编辑，可拖动字段移动位置，右键使用更多功能'
                )}
                {/* <a
                  href='https://v.qq.com/x/page/t08044292dd.html'
                  target='_blank'
                  className='btn-link'
                  rel='noopener noreferrer'
                >
                  {i18next.t('查看视频教程')}
                </a> */}
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
                '表示该模板是针对单一商户的配送单模板（商户配送单），或是账户合并打印配送单（账户配送单）的模板。'
              )}
              bill={templateType}
            />
            <Gap height='5px' />
            <EditorSelect />
            {/* <SpecialField addFields={addFields} mockData={mockData} /> */}
            <EditorCutomizedConfig isDeliverType={isDeliverType} />
            <Gap height='5px' />
            <EditorField
              tableDataKeyList={tableDataKeyList}
              showNewDate={showNewDate}
              isDeliverType={isDeliverType}
            />
            <Gap height='5px' />
            <EditorAddField addFields={addFields} />
            {/* 自适应页面内容开关 */}
            <EditorAdaptive />
            <Gap height='5px' />
            <Observer>
              {() => (
                <Flex alignCenter className='gm-padding-top-5'>
                  <div>
                    {i18next.t('页码始终按打印顺序和打印订单总页数展示')}：
                  </div>
                  <Switch
                    checked={
                      editStore?.config?.printedPageOrderAndTotal === undefined
                        ? false
                        : editStore?.config?.printedPageOrderAndTotal
                    }
                    onChange={editStore.setPrintedPageOrderAndTotal}
                  />
                </Flex>
              )}
            </Observer>
            <Gap height='5px' />
            {/* 配送单特殊设置 */}
            {!!addFields?.specialFields && (
              <EditorSpacialSetting addFields={addFields} />
            )}
            <Gap height='5px' />
            {!!addFields?.orderPerSummaryFields && (
              <EditorPageSummary
                orderPerSummaryFields={addFields.orderPerSummaryFields}
              />
            )}
            {editStore.computedRegionIsTable && (
              <>
                <Title title='表头打印' />
                <Flex alignCenter className='gm-padding-top-5'>
                  <div>{i18next.t('仅首页打印表头')}：</div>
                  <Switch
                    checked={
                      editStore?.config?.isPrintTableHeader === undefined
                        ? false
                        : !editStore?.config?.isPrintTableHeader
                    }
                    onChange={editStore.setIsPrintTableHeader}
                  />
                </Flex>
              </>
            )}
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
  showEditor: PropTypes.bool,
  mockData: PropTypes.object.isRequired,
  addFields: PropTypes.object.isRequired,
  showNewDate: PropTypes.bool,
  className: PropTypes.string,
  uploadQiniuImage: PropTypes.func,
  templateTags: PropTypes.array,
  isDeliverType: PropTypes.bool,
  editStore: PropTypes.object
}

Editor.deaultProps = {
  onSave: _.noop,
  showNewDate: false,
  isDeliverType: false
}

export default Editor
