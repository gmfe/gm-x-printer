import React, { useState } from 'react'
import classNames from 'classnames'

import Option from '../select/option'

const TagSelect = ({ options = [], value = [], onChange }) => {
  const [open, setOpen] = useState(false)
  const domRef = React.useRef(null)
  const inputRef = React.useRef(null)

  const removeTag = tag => {
    onChange(value.filter(t => t !== tag))
  }
  // 键盘事件
  const handleKeyDown = e => {
    switch (e.keyCode) {
      case 8:
        if (!e.target.value) {
          onChange(value.slice(0, value.length - 1))
        }
        break
      case 13:
        if (e.target.value) {
          if (value.indexOf(e.target.value) === -1) {
            onChange([...value, e.target.value])
          }
          e.target.value = ''
        }
        break
      default:
        break
    }
  }
  const handleClick = () => {
    setOpen(true)
  }
  const handleDocumentClick = e => {
    const { target } = e
    if (domRef.current && !domRef.current.contains(target)) {
      setOpen(false)
    }
  }

  React.useEffect(() => {
    const shadowDiv = document.querySelector('#shadowroot')
    if (!shadowDiv) {
      return
    }
    const shadowRoot = shadowDiv.shadowRoot
    if (open && shadowRoot) {
      if (!shadowRoot) {
        return
      }
      shadowRoot.addEventListener('click', handleDocumentClick)
      return () => {
        shadowRoot.removeEventListener('click', handleDocumentClick)
      }
    }
  }, [open])
  return (
    <div
      className={classNames('gm-select gm-tag-select ', {
        'gm-select-open': open
      })}
      ref={domRef}
    >
      <label onClick={handleClick}>
        <div className='gm-select-selection'>
          {value.map((tag, index) => (
            <div key={index} className='gm-tag'>
              <span>{tag}</span>
              <i className='gm-icon-close' onClick={() => removeTag(tag)} />
            </div>
          ))}
          <input ref={inputRef} onKeyDown={e => handleKeyDown(e)} />
        </div>
      </label>
      {open && (
        <div
          key='list'
          className='gm-select-list gm-animated gm-animated-fade-in-right'
        >
          {options.length === 0 && (
            <div className='gm-select-list-empty'>无匹配选项</div>
          )}
          {options.map((option, index) => (
            <Option
              key={index}
              className={value.indexOf(option) !== -1 ? 'selected' : ''}
              onClick={() => {
                if (value.indexOf(option) === -1) {
                  onChange([...value, option])
                } else {
                  onChange(value.filter(tag => tag !== option))
                }
                inputRef.current.focus()
              }}
            >
              {option}
            </Option>
          ))}
        </div>
      )}
    </div>
  )
}

export default TagSelect
