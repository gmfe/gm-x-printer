import React from 'react'
import Printer from './printer'
import 'normalize.css/normalize.css'
import './style.less'
import _ from 'lodash'
import PropTypes from 'prop-types'

class BatchPrinter extends React.Component {
  render () {
    const {
      config,
      datas, tableDatas
    } = this.props

    return (
      <div>
        {_.map(datas, (v, i) => (
          <Printer
            key={i}
            data={datas[i]}
            tableData={tableDatas[i]}
            config={config}
          />
        ))}
      </div>
    )
  }
}

BatchPrinter.propTypes = {
  config: PropTypes.object.isRequired,
  datas: PropTypes.object,
  tableDatas: PropTypes.array
}

export default BatchPrinter
