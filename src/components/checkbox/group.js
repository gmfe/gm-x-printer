import React, { useEffect, useRef } from 'react'
import { Flex, Checkbox } from '../index'
import PropTypes from 'prop-types'

const CheckboxGroup = props => {
  const { options = [], value, onChange } = props

  const [innerValue, setInnerValue] = React.useState(() => {
    if (value !== undefined) {
      return value
    } else {
      return []
    }
  })

  const isFirstRender = useRef(true)

  useEffect(() => {
    if (value === undefined && !isFirstRender.current) {
      setInnerValue(value)
    }
    isFirstRender.current = false
  }, [value])

  const mergedValue = value === undefined ? innerValue : value

  const handleChange = (val, isChecked) => {
    let res = [...mergedValue]
    if (isChecked) {
      res = [...res, val]
    } else {
      res = mergedValue.filter(item => item !== val)
    }
    if (value === undefined) {
      setInnerValue(res)
    }
    onChange && onChange(res)
  }

  return (
    <Flex row>
      {options.map(_item => {
        const isChecked = mergedValue.includes(_item.value)
        return (
          <Checkbox
            key={_item.value}
            onChange={() => handleChange(_item.value, !isChecked)}
            checked={isChecked}
          >
            <span>
              {_item.label} {isChecked}
            </span>
          </Checkbox>
        )
      })}
    </Flex>
  )
}

CheckboxGroup.propTypes = {
  options: PropTypes.array,
  value: PropTypes.any,
  onChange: PropTypes.func
}

export default CheckboxGroup
