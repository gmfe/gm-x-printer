import React from 'react'
import PropTypes from 'prop-types'
import i18next from '../../locales'
import { ToolTip } from '../components'

const EditTemplateType = ({ tip, bill }) => {
  return (
    <>
      <>{i18next.t('模板类型')}</>
      {tip && <ToolTip text={tip} />}
      <span>{i18next.t('：') + bill}</span>
    </>
  )
}
EditTemplateType.propTypes = {
  tip: PropTypes.string,
  bill: PropTypes.string
}
export default EditTemplateType
