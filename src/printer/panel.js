import React from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import _ from 'lodash'
import { dispatchMsg, getBlockName, getPageHeight, pxAdd } from '../util'
import classnames from 'classnames'
import Block from './block'

@inject('printerStore')
@observer
class Panel extends React.Component {
  constructor(props) {
    super(props)
    this.ref = React.createRef()
    this.state = {
      clientY: null
    }
  }

  componentDidMount() {
    const { name, printerStore } = this.props

    if (!printerStore.ready) {
      const $dom = this.ref.current

      // 分页占位高度 = max(panel 盒高, 绝对定位 block 溢出的最大 bottom)。
      // getPageHeight(offsetHeight) 感知不到 position:absolute 溢出 panel 的 block
      // （典型：印章在编辑器里被拖到所在区域之外），只按盒高分页时，
      // 长文档会把该 panel 排到页底附近，溢出 block 被挤出页底——
      // 打印被纸张裁掉，电子签量出的印章 Y 坐标超过页高被腾讯拒绝（Y坐标不合法）。
      // 取两者最大后，分页会为溢出 block 预留空间（放不下则整 panel 推入新页）。
      let height = getPageHeight($dom)
      const styles = window.getComputedStyle($dom)
      const contentTop =
        $dom.getBoundingClientRect().top +
        parseFloat(styles.borderTopWidth) +
        parseFloat(styles.paddingTop)
      const blocks = $dom.querySelectorAll('.gm-printer-block')
      for (let i = 0; i < blocks.length; i++) {
        const blockBottom =
          blocks[i].getBoundingClientRect().bottom - contentTop
        if (blockBottom > height) {
          height = blockBottom
        }
      }

      printerStore.setHeight(name, height)
    }
  }

  handleDragStart = ({ clientY }) => {
    // 这里在拖拽也要选择区域，不然选中A的区域，拉的B的区域，就导致错误
    const { name } = this.props
    dispatchMsg('gm-printer-select-region', {
      selected: name
    })

    this.setState({
      clientY
    })
  }

  handleDragEnd = ({ clientY }) => {
    const { name, config } = this.props

    let diffY = clientY - this.state.clientY

    // 如果是签名和 footer 则反向
    if (name === 'sign' || name === 'footer') {
      diffY = -diffY
    }

    dispatchMsg('gm-printer-panel-style-set', {
      name,
      style: {
        height: pxAdd(config.style.height, diffY)
      }
    })
  }

  handleAutoHeight = ({ button }) => {
    // 鼠标中键(也就是滚轮)呗按下时,设置高度自动
    if (button === 1) {
      const { name } = this.props
      dispatchMsg('gm-printer-panel-style-set', {
        name,
        style: {
          height: 'auto'
        }
      })
    }
  }

  handleSelectedRegion = () => {
    const { name } = this.props

    dispatchMsg('gm-printer-select-region', { selected: name })
  }

  render() {
    const {
      name,
      config,
      placeholder,
      pageIndex,
      style,
      printerStore
    } = this.props
    const active = name === printerStore.selectedRegion
    return (
      <div
        ref={this.ref}
        className={classnames('gm-printer-panel', `gm-printer-${name}`, {
          active
        })}
        data-name={name}
        data-placeholder={placeholder}
        style={Object.assign({}, style, config.style)}
        onClick={this.handleSelectedRegion}
      >
        {_.map(config.blocks, (block, i) =>
          block.pageAnchor ? null : (
            <Block
              key={i}
              name={getBlockName(name, i)}
              config={block}
              pageIndex={pageIndex}
            />
          )
        )}
        <div
          draggable
          onMouseUp={this.handleAutoHeight}
          className='gm-printer-panel-drag'
          onDragStart={this.handleDragStart}
          onDragEnd={this.handleDragEnd}
        />
      </div>
    )
  }
}

Panel.propTypes = {
  name: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
  placeholder: PropTypes.string,
  pageIndex: PropTypes.number.isRequired,
  style: PropTypes.object,
  printerStore: PropTypes.object
}

export default Panel
