import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { Flex, CheckboxGroup } from '../components'
import { Gap, Title } from '../common/component'
import editStore, { StatisticsSettingEnum } from './store'
import { observer, inject } from 'mobx-react'
import EditorTitle from '../common/editor_title'
import EditorSelect from '../common/editor_select'
import EditorField from '../common/editor_edit_field'
import EditorAddField from '../common/editor_add_field'
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
      uploadQiniuImage
    } = this.props

    const options = [
      {
        label: i18next.t('显示合计'),
        value: StatisticsSettingEnum.LIST
      },
      {
        label: i18next.t('显示小计'),
        value: StatisticsSettingEnum.LIST_SUBTOTAL
      }
    ]

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
            <Gap height='5px' />
            <EditorSelect />
            {/* <SpecialField addFields={addFields} mockData={mockData} /> */}
            <Gap height='5px' />
            <Flex alignCenter>
              <Flex alignCenter>{i18next.t('统计设置')}：</Flex>
              <CheckboxGroup
                value={editStore.config.statisticsSetting}
                options={options}
                onChange={value => {
                  editStore.setStatisticsSetting(value)
                }}
              />
            </Flex>
            <Gap height='5px' />
            <EditorField
              tableDataKeyList={tableDataKeyList}
              showNewDate={showNewDate}
              showProductPermutation={false}
            />
            <Gap height='5px' />
            <EditorAddField addFields={addFields} />
            <Gap height='5px' />
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
  uploadQiniuImage: PropTypes.func,
  templateTags: PropTypes.array,
  className: PropTypes.string
}

Editor.deaultProps = {
  onSave: _.noop,
  showNewDate: false
}

export default Editor
