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
  }

  handleCombineDetailShow = bool => {
    const { editStore } = this.props
    editStore.setCombineIngredientDetail(bool)
    editStore.setSelected()
  }

  handlePrintBaseUnitSkuOnly = bool => {
    const { editStore } = this.props
    editStore.setPrintBaseUnitSkuOnly(bool)
  }

  render() {
    const {
      addFields: { combineTableFields },
      editStore,
      hideCombineSkuSetting
    } = this.props
    const {
      combineSkuDetail,
      ingredientDetail,
      printBaseUnitSkuOnly
    } = editStore.config

    return (
      <>
        {!hideCombineSkuSetting && (
          <>
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
                      onChange={e =>
                        this.handleCombineDetailShow(e.target.checked)
                      }
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
            <Gap />
          </>
        )}
        <div>
          <Title title={i18next.t('报价设置')} />
          <Gap />
          <Flex alignCenter className='gm-padding-top-5'>
            <div>{i18next.t('只打印商品基本单位报价')}：</div>
            <Switch
              checked={!!printBaseUnitSkuOnly}
              onChange={e => this.handlePrintBaseUnitSkuOnly(e)}
            />
          </Flex>
          <div>{i18next.t('开启后，无基本单位报价的商品不打印')}</div>
        </div>
      </>
    )
  }
}

@inject('editStore')
@observer
class EditorSpecialTable extends React.Component {
  render() {
    const { editStore, hideCombineSkuSetting } = this.props
    if (editStore.computedRegionIsTable) {
      const arr = editStore.selectedRegion.split('.')
      const tableConfig = editStore.config.contents[arr[2]]
      // 可以编辑明细的table
      if (tableConfig?.specialConfig) {
        return (
          <TableDetailEditor
            config={tableConfig}
            addFields={this.props.addFields}
            hideCombineSkuSetting={hideCombineSkuSetting}
          />
        )
      } else {
        return null
      }
    }
    return null
  }
}

EditorSpecialTable.propTypes = {
  addFields: PropTypes.object.isRequired,
  editStore: PropTypes.object.isRequired,
  hideCombineSkuSetting: PropTypes.bool
}

TableDetailEditor.propTypes = {
  addFields: PropTypes.object.isRequired,
  editStore: PropTypes.object.isRequired,
  hideCombineSkuSetting: PropTypes.bool
}

export default EditorSpecialTable
