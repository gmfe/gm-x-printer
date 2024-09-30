import React, { useEffect, useRef, useState } from 'react'
import Flex from '../flex'
import classNames from 'classnames'
import PropTypes from 'prop-types'

const Checkbox = props => {
  const { checked, onChange, children } = props
  const [innerChecked, setInnerChecked] = useState(() => {
    if (checked !== undefined) {
      return checked
    } else {
      return false
    }
  })

  const isFirstRender = useRef(true)

  const mergedValue = checked === undefined ? innerChecked : checked

  useEffect(() => {
    if (checked === undefined && !isFirstRender.current) {
      setInnerChecked(checked)
    }
    isFirstRender.current = false
  }, [checked])

  const handleChange = isChecked => {
    console.log(isChecked)
    if (checked === undefined) {
      setInnerChecked(isChecked)
    }
    onChange && onChange(isChecked)
  }

  return (
    <div onClick={e => handleChange(!mergedValue)}>
      <Flex className='checkbox'>
        <div
          className={classNames('checkbox__inner', {
            'checkbox__inner--checked': mergedValue
          })}
        />
        <>{children}</>
      </Flex>
    </div>
  )
}

Checkbox.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func
}

export default Checkbox
