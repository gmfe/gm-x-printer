import { inject, observer } from 'mobx-react'
import PropTypes from 'prop-types'
import React from 'react'
import { Flex, Switch } from '../components'
import { SHEET_TITLE_MAP } from '../config'
import i18next from '../../locales'

@inject('editStore')
@observer
class EditorSubtotal extends React.Component {
  render() {
    const { editStore, templateType } = this.props
    const { config } = editStore
    if (!editStore.computedRegionIsTable) {
      return null
    }
    if (!editStore.selected) {
      return null
    }
    const arr = editStore.selected.split('.')
    const { dataKey } = config.contents[arr[2]]
    const keyArr = dataKey.split('_')

    const isQuantityActive = keyArr.includes('quantity')
    const isMoneyActive = keyArr.includes('money')
    return (
      <>
        <Flex alignCenter className='gm-padding-top-5'>
          <div>
            {`${SHEET_TITLE_MAP[templateType]}`}
            {i18next.t('(业务单位)数小计')}
            {i18next.t('：')}
          </div>
          <Switch
            checked={isQuantityActive}
            onChange={checked => {
              editStore.changeTableDataKeyStockIn(
                editStore.selected,
                'quantity'
              )
            }}
          />
        </Flex>
        <Flex alignCenter className='gm-padding-top-5'>
          <div>
            {`${SHEET_TITLE_MAP[templateType]}`}
            {i18next.t('金额小计')}
            {i18next.t('：')}
          </div>
          <Switch
            checked={isMoneyActive}
            onChange={checked => {
              editStore.changeTableDataKeyStockIn(editStore.selected, 'money')
            }}
          />
        </Flex>
      </>
    )
  }
}

EditorSubtotal.propTypes = {
  editStore: PropTypes.object
}

export default EditorSubtotal
