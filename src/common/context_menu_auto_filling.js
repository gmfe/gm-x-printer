import i18next from '../../locales'
import React from 'react'
import { getAutoFillingConfig } from '../util'

export default class ContextMenuAutoFilling extends React.Component {
  constructor(props) {
    super(props)
    this.props = props
  }

  render() {
    const { isAutoFilling, onChangeTableData } = this.props
    const isAutoFillingBool = getAutoFillingConfig(isAutoFilling) !== 'manual'

    return (
      <div
        onClick={() =>
          onChangeTableData?.(isAutoFillingBool ? 'manual' : 'empty')
        }
        className={isAutoFillingBool ? 'active' : ''}
      >
        {i18next.t('行数填充')}
      </div>
    )
  }
}
