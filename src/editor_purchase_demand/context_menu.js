import React from 'react'
import PropTypes from 'prop-types'
import CommonContextMenu from '../common/common_context_menu'
import { inject, observer } from 'mobx-react'
import { Printer } from '../printer'

const blockTypeList = []

@inject('editStore')
@observer
class ContextMenu extends React.Component {
  handleChangeTableDataKey = (key, name) => {
    const { editStore } = this.props

    editStore.changeTableDataKey(name, key)
  }

  handleChangeTableData = isAutoFilling => {
    const { editStore } = this.props
    editStore.handleChangeTableData(isAutoFilling)
  }

  /** 右键table */
  renderOrderActionBtn = name => {
    return <></>
  }

  render() {
    const { editStore, uploadQiniuImage } = this.props
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
          isAutoFilling={false}
          lineheight={editStore.computedTableCustomerRowHeight}
          config={editStore.config}
          data={editStore.mockData}
          getremainpageHeight={editStore.setRemainPageHeight}
          updateData={editStore.updateData}
        />
      </CommonContextMenu>
    )
  }
}
ContextMenu.propTypes = {
  editStore: PropTypes.object,
  uploadQiniuImage: PropTypes.func
}
export default ContextMenu
