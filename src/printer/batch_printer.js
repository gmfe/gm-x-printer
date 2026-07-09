import React from 'react'
import Printer from './printer'
import _ from 'lodash'
import PropTypes from 'prop-types'

class BatchPrinter extends React.Component {
  constructor(props) {
    super(props)
    this.ready = 0
  }

  handleReady = () => {
    this.ready++
    if (this.ready === this.props.list.length) {
      this.props.onReady()
    }
  }

  render() {
    const { list, showSealInPrint } = this.props

    return _.map(list, ({ config, data }, i) => (
      <Printer
        isInPrint
        showSealInPrint={showSealInPrint}
        key={i}
        batchKey={`${(data?.batchKey || '') + '-' + i}`}
        data={data}
        config={config}
        onReady={this.handleReady}
      />
    ))
  }
}

BatchPrinter.propTypes = {
  list: PropTypes.array.isRequired,
  onReady: PropTypes.func,
  // 印章定位块在打印态(isInPrint)是否渲染（电子签量坐标用，见 block.js isSeal 分支）
  showSealInPrint: PropTypes.bool
}

BatchPrinter.defaultProps = {
  onReady: _.noop,
  showSealInPrint: false
}

export default BatchPrinter
