import React from 'react'
import PropTypes from 'prop-types'

const Radio = ({ id, value, onChange, checked, style, label }) => (
  <div style={style}>
    <input
      type='radio'
      value={value}
      id={id}
      name='radio'
      onChange={onChange}
      checked={checked}
      style={{ margin: '5px 5px 0 0' }}
    />
    <label htmlFor={id} style={{ minWidth: '120px' }}>
      {label}
    </label>
  </div>
)

Radio.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.string,
  style: PropTypes.string,
  onChange: PropTypes.func,
  checked: PropTypes.bool
}

const RadioGroup = ({ onChange, options, children, value, style }) => {
  if (!Array.isArray(options)) return children
  return options.map(item => {
    return (
      <Radio
        key={item.value}
        value={item.value}
        label={item.label}
        checked={value === item.value}
        onChange={onChange}
        style={style}
      />
    )
  })
}

RadioGroup.propTypes = {
  defaultValue: PropTypes.any,
  value: PropTypes.any,
  options: PropTypes.array,
  style: PropTypes.string,
  onChange: PropTypes.func
}

Radio.Group = RadioGroup

export default Radio
