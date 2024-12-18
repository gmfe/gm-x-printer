import i18next from '../../locales'
import React from 'react'
import PropTypes from 'prop-types'
import CommonContextMenu from '../common/common_context_menu'
import { inject, observer } from 'mobx-react'
import { Printer } from '../printer'

const blockTypeList = [
  { value: '', text: i18next.t('插入文本') },
  { value: 'line', text: i18next.t('插入线条') }
]

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
    return <></>
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
  editStore: PropTypes.any,
  mockData: PropTypes.object,
  uploadQiniuImage: PropTypes.func
}

export default ContextMenu
