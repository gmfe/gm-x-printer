import i18next from '../../locales'
import React from 'react'
import PropTypes from 'prop-types'
import { Flex, Switch } from '../components/index'
import { Gap, Title, FieldBtn } from '../common/component'
import _ from 'lodash'
import { inject, observer } from 'mobx-react'

@inject(stores => ({
  editStore: stores.editStore,
  mockData: stores.mockData
}))
@observer
class TableDetailEditor extends React.Component {
  handleDetailAddField = value => {
    const { editStore } = this.props
    editStore.addFieldToTable(value)
  }

  handleCombineShow = bool => {
    const { editStore } = this.props
    editStore.setCombineSkuDetail(bool)
    const showDetail = editStore.config.ingredientDetail.show
    const newContent = editStore.config.contents.filter(c => c.id !== 'combine')
    const originCombineContent = editStore.originConfig.contents.find(
      c =>
        c.id === 'combine' &&
        c.dataKey === (showDetail ? 'combine_withIg' : 'combine_withoutIg')
    )
    editStore.setSelected()
    editStore.setConfig({
      ...editStore.config,
      contents: bool ? [...newContent, originCombineContent] : newContent
    })
  }

  handleCombineDetailShow = bool => {
    const { editStore } = this.props
    editStore.setCombineIngredientDetail(bool)
    editStore.setSelected()

    const newContent = editStore.config.contents.find(c => c.id === 'combine')

    newContent.dataKey = bool ? 'combine_withIg' : 'combine_withoutIg'

    editStore.setConfig({
      ...editStore.config,
      contents: [
        ...editStore.config.contents.filter(c => c.id !== 'combine'),
        newContent
      ]
    })
  }

  render() {
    const {
      addFields: { combineTableFields },
      editStore
    } = this.props
    const { combineSkuDetail, ingredientDetail } = editStore.config

    return (
      <div>
        <Title title={i18next.t('组合商品设置')} />
        <Gap />

        <Flex alignCenter className='gm-padding-top-5'>
          <div>{i18next.t('组合商品展示')}：</div>
          <Switch
            checked={combineSkuDetail.show}
            onChange={e => this.handleCombineShow(e)}
          />
        </Flex>

        {combineSkuDetail.show && (
          <>
            <div className='gm-padding-top-5'>
              <input
                type='checkbox'
                checked={ingredientDetail.show}
                onChange={e => this.handleCombineDetailShow(e.target.checked)}
              />
              <span>&nbsp;{i18next.t('子商品明细展示')}</span>
            </div>
            {editStore.isSelectingCombine && (
              <div className='gm-padding-top-5'>
                <div>{i18next.t('添加字段')}：</div>
                <Flex wrap>
                  {_.map(combineTableFields, o => (
                    <FieldBtn
                      key={o.key}
                      name={o.key}
                      onClick={this.handleDetailAddField.bind(this, o)}
                    />
                  ))}
                </Flex>
              </div>
            )}
          </>
        )}
      </div>
    )
  }
}

@inject('editStore')
@observer
class EditorCombineTable extends React.Component {
  render() {
    const { editStore } = this.props
    if (editStore.computedRegionIsTable) {
      const arr = editStore.selectedRegion.split('.')
      const tableConfig = editStore.config.contents[arr[2]]
      // 可以编辑明细的table
      if (tableConfig?.specialConfig) {
        return (
          <TableDetailEditor
            config={tableConfig}
            addFields={this.props.addFields}
          />
        )
      } else {
        return null
      }
    }
    return null
  }
}

EditorCombineTable.propTypes = {
  addFields: PropTypes.object.isRequired,
  editStore: PropTypes.object.isRequired
}

TableDetailEditor.propTypes = {
  addFields: PropTypes.object.isRequired,
  editStore: PropTypes.object.isRequired
}

export default EditorCombineTable
