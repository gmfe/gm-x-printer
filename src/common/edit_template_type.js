import React from 'react'
import PropTypes from 'prop-types'
import i18next from '../../locales'
import { ToolTip } from '../components'

const EditTemplateType = ({ tip, bill }) => {
  return (
    <>
      <>{i18next.t('模版类型')}</>
      {tip && <ToolTip text={tip} />}
      <span>{'：' + bill}</span>
    </>
  )
}
EditTemplateType.propTypes = {
  tip: PropTypes.string,
  bill: PropTypes.string
}
export default EditTemplateType
