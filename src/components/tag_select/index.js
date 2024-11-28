import React, { useState } from 'react'
import classNames from 'classnames'
import _ from 'lodash'

import Option from '../select/option'
import i18next from '../../../locales'

const TagSelect = ({
  options = [],
  value = [],
  onChange,
  isMultiple = true
}) => {
  const [open, setOpen] = useState(false)
  const domRef = React.useRef(null)
  const inputRef = React.useRef(null)
  const [inputValue, setInputValue] = useState('')

  const showInput = isMultiple || open

  const computedOptions = React.useMemo(() => {
    let newOptions = _.uniq([...value, ...options])
    if (inputValue) {
      newOptions = options.filter(option => option.indexOf(inputValue) !== -1)
      if (options.indexOf(inputValue) === -1) {
        newOptions.unshift(inputValue)
      }
    }
    return newOptions
  }, [inputValue, options, value])

  const addTag = tag => {
    setInputValue('')
    if (isMultiple) {
      onChange([...value, tag])
    } else {
      onChange([tag])
      setOpen(false)
    }
  }

  const removeTag = tag => {
    onChange(value.filter(t => t !== tag))
  }
  const removeLastTag = () => {
    onChange(value.slice(0, value.length - 1))
  }

  // 键盘事件
  const handleKeyDown = e => {
    switch (e.keyCode) {
      case 8:
        if (!e.target.value) {
          removeLastTag()
        }
        break
      case 13:
        if (e.target.value) {
          if (value.indexOf(e.target.value) === -1) {
            addTag(e.target.value)
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
  React.useEffect(() => {
    if (!open) {
      setInputValue('')
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
          {isMultiple
            ? value.map((tag, index) => (
                <div key={index} className='gm-tag'>
                  <span>{tag}</span>
                  <i className='gm-icon-close' onClick={() => removeTag(tag)} />
                </div>
              ))
            : !open && (
                <div>
                  <span>{value}</span>
                </div>
              )}
          {showInput && (
            <input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              ref={inputRef}
              onKeyDown={e => handleKeyDown(e)}
            />
          )}
        </div>
      </label>
      {open && (
        <div
          key='list'
          className='gm-select-list gm-animated gm-animated-fade-in-right'
        >
          {computedOptions.length === 0 && (
            <div className='gm-select-list-empty'>
              {i18next.t('无匹配选项')}
            </div>
          )}
          {computedOptions.map((option, index) => (
            <Option
              key={index}
              className={value.indexOf(option) !== -1 ? 'selected' : ''}
              onClick={() => {
                if (value.indexOf(option) === -1) {
                  addTag(option)
                } else {
                  removeTag(option)
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
