import i18next from '../../locales'
import React from 'react'
import PropTypes from 'prop-types'
import CommonContextMenu from '../common/common_context_menu'
import { inject, observer } from 'mobx-react'
import _ from 'lodash'
import { Printer } from '../printer'

const blockTypeList = [
  { value: 'rise', text: i18next.t('插入抬头') },
  { value: '', text: i18next.t('插入文本') },
  { value: 'line', text: i18next.t('插入线条') },
  { value: 'image', text: i18next.t('插入图片') },
  { value: 'counter', text: i18next.t('插入分类汇总') },
  { value: 'barcode', text: i18next.t('插入订单条形码') },
  { value: 'qrcode', text: i18next.t('插入订单详情二维码') },
  { value: 'qrcode_trace', text: i18next.t('插入订单溯源二维码') }
]

@inject('editStore')
@observer
class ContextMenu extends React.Component {
  componentDidMount() {
    const {
      editStore,
      editStore: {
        config: { autoFillConfig }
      }
    } = this.props

    if (autoFillConfig?.checked) {
      editStore.handleChangeTableData(
        autoFillConfig?.checked,
        autoFillConfig?.dataKey
      )
    }
  }

  /**
   * 是否存在每页合计按钮,非异常明细才有按钮
   * @param name => ContextMenu 的 this.state.name
   * @return {boolean}
   */
  hasSubtotalBtn = name => {
    if (!name) return false
    const noSubtotalList = ['abnormal', 'abnormalDetails']
    const arr = name.split('.')
    if (_.includes(arr, 'table')) {
      const dataKey = this.props.editStore.config.contents[arr[2]].dataKey
      return !_.includes(noSubtotalList, dataKey)
    }
  }

  handleChangeTableDataKey = (key, name) => {
    const { editStore } = this.props

    editStore.changeTableDataKey(name, key)
  }

  handleChangeTableData = isAutoFilling => {
    const { editStore } = this.props
    editStore.handleChangeTableData(isAutoFilling)
  }

  renderOrderActionBtn = name => {
    if (!this.hasSubtotalBtn(name)) {
      return null
    }

    const {
      editStore: { isAutoFilling }
    } = this.props
    const arr = name.split('.')
    const { dataKey } = this.props.editStore.config.contents[arr[2]]
    const keyArr = dataKey.split('_')

    const isMultiActive = keyArr.includes('multi')
    const isCategoryActive = keyArr.includes('category')

    const isCombine =
      keyArr.includes('combination') || keyArr.includes('allprod')

    const isfakeOutstockPrice = keyArr.includes('fake')

    return (
      <>
        <div
          onClick={this.handleChangeTableDataKey.bind(this, 'multi', name)}
          className={isMultiActive ? 'active' : ''}
        >
          {i18next.t('双栏商品')}
        </div>
        {/* 组合商品没做商品分类 */}
        {!isCombine && (
          <>
            <div
              onClick={this.handleChangeTableDataKey.bind(
                this,
                'category',
                name
              )}
              className={isCategoryActive ? 'active' : ''}
            >
              {i18next.t('分类小计(出库金额)')}
            </div>
            <div
              onClick={this.handleChangeTableDataKey.bind(this, 'fake', name)}
              className={isfakeOutstockPrice ? 'active' : ''}
            >
              {i18next.t('分类小计(套账出库金额)')}
            </div>
          </>
        )}
        <div
          onClick={this.handleChangeTableData.bind(this, !isAutoFilling)}
          className={isAutoFilling ? 'active' : ''}
        >
          {i18next.t('行数填充')}
        </div>
      </>
    )
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
          isAutoFilling={editStore.isAutoFilling}
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
