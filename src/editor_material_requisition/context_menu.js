import i18next from '../../locales'
import React from 'react'
import CommonContextMenu from '../common/common_context_menu'
import { inject, observer } from 'mobx-react'
import { Printer } from '../printer'
import PropTypes from 'prop-types'

const blockTypeList = [
  { value: '', text: i18next.t('插入文本') },
  { value: 'line', text: i18next.t('插入线条') },
  { value: 'image', text: i18next.t('插入图片') },
  { value: 'barcode', text: i18next.t('插入单据条形码') }
]

@inject(stores => ({
  editStore: stores.editStore,
  mockData: stores.mockData
}))
@observer
class ContextMenu extends React.Component {
  handleChangeTableDataKey = (key, name) => {
    const { editStore } = this.props

    editStore.changeTableDataKeyStockout(name, key)
  }

  renderOrderActionBtn = name => {
    //   const arr = name.split('.')
    //   const { dataKey } = this.props.editStore.config.contents[arr[2]]
    //   const keyArr = dataKey.split('_')
    //   const isQuantityActive = keyArr.includes('quantity')
    //   // const isMoneyActive = keyArr.includes('money')
    //   const isMultiActive = keyArr.includes('multi')
    //   return (
    //     <>
    //       <div
    //         onClick={this.handleChangeTableDataKey.bind(this, 'multi', name)}
    //         className={isMultiActive ? 'active' : ''}
    //       >
    //         {i18next.t('双栏商品')}
    //       </div>
    //     </>
    //   )
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
          key={editStore.computedPrinterKey}
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
  config: PropTypes.object.isRequired,
  editStore: PropTypes.func,
  uploadQiniuImage: PropTypes.func,
  mockData: PropTypes.object.isRequired
}
export default ContextMenu
