import i18next from '../../locales'
import React from 'react'
import PropTypes from 'prop-types'
import CommonContextMenu from '../common/common_context_menu'
import { inject, observer } from 'mobx-react'
import { Printer } from '../printer'

const blockTypeList = [
  { value: '', text: i18next.t('插入文本') },
  { value: 'line', text: i18next.t('插入线条') },
  { value: 'image', text: i18next.t('插入图片') }
]

const titleMap = {
  23: '入库',
  24: '出库'
}

@inject(stores => ({
  editStore: stores.editStore,
  mockData: stores.mockData
}))
@observer
class ContextMenu extends React.Component {
  handleChangeTableDataKey = (key, name) => {
    const { editStore } = this.props

    editStore.changeTableDataKeyStockIn(name, key)
  }

  renderOrderActionBtn = name => {
    const arr = name.split('.')
    const { dataKey } = this.props.editStore.config.contents[arr[2]]
    const keyArr = dataKey.split('_')

    const isQuantityActive = keyArr.includes('quantity')
    const isMoneyActive = keyArr.includes('money')
    const isMultiActive = keyArr.includes('multi')

    return (
      <>
        <div
          onClick={this.handleChangeTableDataKey.bind(this, 'multi', name)}
          className={isMultiActive ? 'active' : ''}
        >
          {i18next.t('双栏商品')}
        </div>
        <div
          onClick={this.handleChangeTableDataKey.bind(this, 'quantity', name)}
          className={isQuantityActive ? 'active' : ''}
        >
          {`${titleMap[this.props.templateType]}(业务单位)数小计`}
        </div>
        <div
          onClick={this.handleChangeTableDataKey.bind(this, 'money', name)}
          className={isMoneyActive ? 'active' : ''}
        >
          {`${titleMap[this.props.templateType]}金额小计`}
        </div>
      </>
    )
  }

  render() {
    const { editStore, mockData, uploadQiniuImage } = this.props
    return (
      <CommonContextMenu
        renderTableAction={this.renderOrderActionBtn}
        insertBlockList={blockTypeList}
        uploadQiniuImage={uploadQiniuImage}
      >
        <Printer
          selected={editStore.selected}
          selectedRegion={editStore.selectedRegion}
          config={editStore.config}
          data={mockData}
        />
      </CommonContextMenu>
    )
  }
}

ContextMenu.propTypes = {
  type: PropTypes.string,
  templateType: PropTypes.number
}

export default ContextMenu
