import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import batchPrinterStore from './batch_printer_store'
import Counter from './counter'
import { inject, observer } from 'mobx-react'
import { dispatchMsg, getStyleWithDiff } from '../util'
import BarCode from './barcode'
import QrCode from './qrcode'
import { Flex } from '../components'
import group from '../../assets/group.png'
import customer from '../../assets/customer.png'
import supplier from '../../assets/supplier.png'

@inject('printerStore')
@observer
class Block extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      clientX: null,
      clientY: null,
      isEdit: false
    }
  }

  componentDidMount() {
    window.document.addEventListener(
      'gm-printer-block-edit',
      this.handleBlockEdit
    )
  }

  componentWillUnmount() {
    window.document.removeEventListener(
      'gm-printer-block-edit',
      this.handleBlockEdit
    )
  }

  handleBlockEdit = e => {
    const { name } = this.props

    if (e.detail.name !== name) {
      return
    }

    this.setState(
      {
        isEdit: true
      },
      () => {
        this.refEdit.focus()
        this.refEdit.select()
      }
    )
  }

  handleDragStart = ({ clientX, clientY }) => {
    const { name } = this.props

    this.setState({
      clientX,
      clientY
    })
    dispatchMsg('gm-printer-select', {
      selected: name
    })
  }

  handleDragEnd = ({ clientX, clientY }) => {
    const { config } = this.props
    const diffX = clientX - this.state.clientX
    const diffY = clientY - this.state.clientY

    const style = getStyleWithDiff(config.style, diffX, diffY)

    dispatchMsg('gm-printer-block-style-set', {
      style
    })
  }

  handleClick = () => {
    const { name } = this.props

    dispatchMsg('gm-printer-select', {
      selected: name
    })
  }

  handleDoubleClick = () => {
    const {
      config: { type }
    } = this.props
    if (!type || type === 'text' || type === 'rise') {
      this.setState(
        {
          isEdit: true
        },
        () => {
          this.refEdit && this.refEdit.focus()
        }
      )
    }
  }

  handleEditBlur = () => {
    this.setState({
      isEdit: false
    })
  }

  handleText = e => {
    dispatchMsg('gm-printer-block-text-set', {
      text: e.target.value
    })
  }

  render() {
    let {
      name,
      config: { type, text, link, style, subText, value },
      pageIndex,
      className,
      printerStore,
      ...rest
    } = this.props
    const { isEdit } = this.state
    const isSeal =
      type === 'seal' || type === 'seal_customer' || type === 'seal_supplier'

    // 印章定位块：打印态默认不渲染（仅定位盖章坐标，送签用）；showSealInPrint=true 时打印也显示 assets 印章图（将来需求）
    if (isSeal && printerStore?.isInPrint && !printerStore?.showSealInPrint) {
      return null
    }

    let content = null
    let specialStyle = null
    if (!type || type === 'text' || type === 'rise') {
      content = printerStore.template(
        text,
        pageIndex,
        batchPrinterStore.totalSizes
      )
    } else if (type === 'line') {
      content = null
    } else if (type === 'image') {
      // link 为写死的链接, text 为动态的链接(取接口数据里边的)
      const src = link || printerStore.template(text)
      content = (
        <img
          src={src}
          style={{
            width: '100%',
            height: '100%'
          }}
          alt=''
          data-name={name}
        />
      )
    } else if (type === 'counter') {
      // 🌡特殊处理: counter层级(9) 比 普通block层级(10)低. 为了让普通block被选中
      specialStyle = { zIndex: 9 }
      content = <Counter value={value} />
      name = `${name}.counter`
    } else if (type === 'split_order_title') {
      // ⛑‍分单打印时,特殊的标题(由station的order_print的splitOrder函数修改config)
      content = (
        <div>
          {printerStore.template(text, pageIndex)}
          <span style={{ fontWeight: 'normal' }}>{subText}</span>
        </div>
      )
    } else if (type === 'barcode') {
      content = (
        <>
          <BarCode
            value={printerStore.template(text)}
            textMargin={0}
            margin={0}
            height={35}
            width={2}
            displayValue={false}
            dataName={name}
            background='transparent'
          />
          {printerStore?.config?.showBarCodeText && (
            <Flex style={{ marginLeft: '40px', marginTop: '-5px' }}>
              {printerStore.template(text)}
            </Flex>
          )}
        </>
      )
    } else if (type === 'qrcode' || type === 'qrcode_trace') {
      content = (
        <QrCode
          value={printerStore.template(text)}
          size={parseInt(style.height)}
        />
      )
    } else if (
      type === 'seal' ||
      type === 'seal_customer' ||
      type === 'seal_supplier'
    ) {
      // 印章定位块：用 gm-x-printer 默认 assets（group/customer/supplier.png，按 type）；打印态由 showSealInPrint 控制（上方）
      const sealImg = type === 'seal' ? group : type === 'seal_customer' ? customer : supplier
      content = (
        <img
          className='seal-block'
          src={sealImg}
          style={{
            width: '100%',
            height: '100%'
          }}
          alt=''
          data-name={name}
        />
      )
    } else if (type === 'remark') {
      content = (
        <div
          style={{
            padding: '10px 0'
          }}
        >
          {printerStore.template(text, pageIndex)}
        </div>
      )
    }

    const active = name === printerStore.selected

    return (
      <div
        style={{ ...style, ...specialStyle }}
        className={classNames('gm-printer-block', className, {
          active
        })}
        draggable
        onDragStart={this.handleDragStart}
        onDragEnd={this.handleDragEnd}
        onClick={this.handleClick}
        onDoubleClick={this.handleDoubleClick}
        {...rest}
      >
        <div
          style={{
            position: 'absolute',
            zIndex: 1,
            left: '0',
            top: '0',
            width: '100%',
            height: '100%'
          }}
          data-name={name}
        />
        {(!type || type === 'text' || type === 'rise') && active && isEdit && (
          <textarea
            ref={ref => (this.refEdit = ref)}
            className='gm-printer-block-text-edit'
            value={text}
            onChange={this.handleText}
            onBlur={this.handleEditBlur}
          />
        )}
        {content}
      </div>
    )
  }
}

Block.propTypes = {
  name: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
  pageIndex: PropTypes.number.isRequired,
  className: PropTypes.string,
  printerStore: PropTypes.object
}

export default Block
