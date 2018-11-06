import React from 'react'
import { blockTypeList } from '../config'
import editStore from './store'
import _ from 'lodash'
import { Hr } from './component'

function isSubtotalShow (name) {
  if (!name) return false

  const arr = name.split('.')
  return _.includes(arr, 'table') ? editStore.config.contents[arr[2]].subtotal.show : false
}

/**
 * 是否存在每页合计按钮
 * @param name => ContextMenu ,this.state.name
 * @return {boolean}
 */
function hasSubtotalBtn (name) {
  if (!name) return false

  const arr = name.split('.')
  if (_.includes(arr, 'table')) {
    const dataKey = editStore.config.contents[arr[2]].dataKey
    // 异常明细没有每页小计
    return dataKey !== 'abnormal'
  }
}

class ContextMenu extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: null,
      popup: {
        left: 0,
        top: 0
      },
      block: {
        left: 0,
        top: 0
      }
    }
  }

  componentDidMount () {
    window.document.addEventListener('click', this.handleClick)
  }

  componentWillUnmount () {
    window.document.removeEventListener('click', this.handleClick)
  }

  handleClick = (e) => {
    // 简单处理
    if (e.target.parentNode && e.target.parentNode.className === 'gm-printer-edit-contextmenu') {
      return
    }

    this.setState({
      name: null
    })
  }

  handleContextMenu = (e) => {
    const { target: { dataset: { name } }, clientX, clientY } = e

    if (!name) {
      return
    }

    // name
    // header
    // header.block.0
    // contents.panel.0
    // contents.panel.0.block.0
    // contents.table.0
    // contents.table.0.column.0

    console.log(name)

    e.preventDefault()

    const rect = e.target.getBoundingClientRect()

    this.setState({
      name,
      popup: {
        left: clientX,
        top: clientY
      },
      block: {
        left: clientX - rect.x,
        top: clientY - rect.y
      }
    })
  }

  handleInsertBlock = (type) => {
    const { name, block } = this.state

    editStore.addConfigBlock(name, type, {
      left: block.left + 'px',
      top: block.top + 'px'
    })

    this.setState({
      name: null
    })
  }

  handleRemoveContent = () => {
    const { name } = this.state
    editStore.removeContent(name)

    this.setState({
      name: null
    })
  }

  handleSubtotal = () => {
    const { name } = this.state

    editStore.setSubtotalShow(name)
    this.setState({
      name: null
    })
  }

  handleAddContent = (diff, type) => {
    const { name } = this.state

    editStore.addContentByDiff(name, diff, type)

    this.setState({
      name: null
    })
  }

  renderPanel () {
    const { name } = this.state
    const arr = name.split('.')

    return (
      <React.Fragment>
        {_.map(blockTypeList, v => (
          <div
            key={v.value}
            onClick={this.handleInsertBlock.bind(this, v.value)}
          >{v.text}</div>
        ))}
        {arr[0] === 'contents' && (
          <React.Fragment>
            <Hr/>
            <div onClick={this.handleAddContent.bind(this, 0, '')}>向上插入区域块</div>
            <div onClick={this.handleAddContent.bind(this, 1, '')}>向下插入区域块</div>
            <div onClick={this.handleRemoveContent}>移除区域</div>
            <Hr/>
            <div onClick={this.handleAddContent.bind(this, 0, 'table')}>向上插入表格</div>
            <div onClick={this.handleAddContent.bind(this, 1, 'table')}>向下插入表格</div>
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }

  handleRemove = () => {
    const { name } = this.state

    editStore.setSelected(name)
    editStore.removeConfig()

    this.setState({
      name: null
    })
  }

  renderBlock () {
    return (
      <div onClick={this.handleRemove}>
        移除
      </div>
    )
  }

  renderColumn () {
    const { name } = this.state

    return (
      <React.Fragment>
        {hasSubtotalBtn(name) &&
        <div onClick={this.handleSubtotal} className={isSubtotalShow(name) ? 'active' : ''}>每页合计</div>}
        <div onClick={this.handleRemove}>移除列</div>
        <React.Fragment>
          <Hr/>
          <div onClick={this.handleAddContent.bind(this, 0, '')}>向上插入区域块</div>
          <div onClick={this.handleAddContent.bind(this, 1, '')}>向下插入区域块</div>
          <div onClick={this.handleRemoveContent}>移除区域</div>
          <Hr/>
          <div onClick={this.handleAddContent.bind(this, 0, 'table')}>向上插入表格</div>
          <div onClick={this.handleAddContent.bind(this, 1, 'table')}>向下插入表格</div>
        </React.Fragment>
      </React.Fragment>
    )
  }

  render () {
    const { children, ...rest } = this.props
    const { name, popup } = this.state
    const arr = (name && name.split('.')) || []

    return (
      <div {...rest} onContextMenu={this.handleContextMenu}>
        {children}
        {name && (
          <div className='gm-printer-edit-contextmenu' style={{
            position: 'fixed',
            ...popup
          }}>
            {arr.length === 1 && this.renderPanel()}
            {arr.length === 3 && arr[1] === 'panel' && this.renderPanel()}
            {arr.length === 3 && arr[1] === 'block' && this.renderBlock()}
            {arr.length === 5 && arr[3] === 'block' && this.renderBlock()}
            {arr.length === 5 && arr[1] === 'table' && this.renderColumn()}
          </div>
        )}
      </div>
    )
  }
}

ContextMenu.propTypes = {}

ContextMenu.deaultProps = {}

export default ContextMenu
