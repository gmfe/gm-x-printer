import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _ from 'lodash'
// eslint-disable-next-line import/named
import { borderStyleList, TYPE_ENUM } from '../config'
import { Flex, Tip, ToolTip, MaterialSymbolsBorderOuter } from '../components'
import { Request } from 'gm-util'
import i18next from '../../locales'

class IconAlign extends React.Component {
  render() {
    const style = {
      display: 'block',
      background: 'black',
      width: '100%',
      height: '1px',
      marginBottom: '1px'
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          width: '1em',
          verticalAlign: 'middle',
          flexDirection: 'column',
          alignItems: {
            left: 'flex-start',
            center: 'center',
            right: 'flex-end'
          }[this.props.textAlign]
        }}
      >
        <span style={{ ...style }} />
        <span style={{ ...style, width: '60%' }} />
        <span style={{ ...style }} />
        <span style={{ ...style, width: '60%' }} />
        <span style={{ ...style }} />
      </span>
    )
  }
}

IconAlign.propTypes = {
  textAlign: PropTypes.string
}

IconAlign.defaultProps = {
  textAlign: 'left'
}

class Separator extends React.Component {
  render() {
    return (
      <span
        style={{
          display: 'inline-block',
          margin: '0 5px',
          borderLeft: '1px solid #c1c8cc',
          height: '1em',
          verticalAlign: 'middle'
        }}
      />
    )
  }
}

class Text extends React.Component {
  handleChange = e => {
    const { onChange } = this.props
    onChange(e.target.value)
  }

  render() {
    const { value, placeholder, style, className } = this.props
    return (
      <input
        className={classNames('gm-printer-edit-input', className)}
        type='text'
        value={value}
        placeholder={placeholder}
        onChange={this.handleChange}
        style={style}
      />
    )
  }
}

Text.propTypes = {
  value: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
    PropTypes.object
  ]),
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired
}

class Textarea extends React.Component {
  handleChange = e => {
    const { onChange } = this.props
    onChange(e.target.value)
  }

  render() {
    const { value, placeholder, style } = this.props
    return (
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={this.handleChange}
        style={{
          width: '100%',
          ...style
        }}
      />
    )
  }
}

Textarea.propTypes = {
  value: PropTypes.string,
  style: PropTypes.object,
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired
}

// 10px => 10  10% => 10%
class TextPX extends React.Component {
  handleChange = value => {
    const { onChange } = this.props
    console.log(value === '')
    if (value === '') {
      onChange('')
    } else if (value.endsWith('%')) {
      onChange(value)
    } else {
      onChange(value + 'px')
    }
  }

  render() {
    const { value = '' } = this.props

    let nValue = value
    if (value.endsWith('px')) {
      nValue = value.replace(/px/g, '')
    }

    return (
      <Text
        value={nValue}
        onChange={_.throttle(this.handleChange, 500)}
        style={{ width: '35px' }}
      />
    )
  }
}

TextPX.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired
}

class Fonter extends React.Component {
  handleChange = (type, value) => {
    const { style, onChange } = this.props
    onChange({
      ...style,
      [type]: value
    })
  }

  handleChangeObj = obj => {
    const { style, onChange } = this.props
    onChange({
      ...style,
      ...obj
    })
  }

  render() {
    const { style, type } = this.props

    return (
      <span className='gm-printer-edit-fonter'>
        <TextPX
          onChange={this.handleChange.bind(this, 'fontSize')}
          value={style.fontSize}
        />
        <Separator />
        <span
          className={classNames('gm-printer-edit-btn', {
            active: style.fontWeight === 'bold'
          })}
          style={{ fontWeight: 'bold' }}
          onClick={() =>
            this.handleChange(
              'fontWeight',
              style.fontWeight === 'bold' ? '' : 'bold'
            )
          }
        >
          B
        </span>
        <span
          className={classNames('gm-printer-edit-btn', {
            active: style.fontStyle === 'italic'
          })}
          style={{ fontStyle: 'italic' }}
          onClick={() =>
            this.handleChange(
              'fontStyle',
              style.fontStyle === 'italic' ? '' : 'italic'
            )
          }
        >
          I
        </span>
        <span
          className={classNames('gm-printer-edit-btn', {
            active: style.textDecoration === 'underline'
          })}
          style={{ textDecoration: 'underline' }}
          onClick={() =>
            this.handleChange(
              'textDecoration',
              style.textDecoration === 'underline' ? '' : 'underline'
            )
          }
        >
          U
        </span>
        <Separator />
        {(!type || type === 'text' || type === 'rise' || type === 'remark') && (
          <>
            <span
              className={classNames({
                lineHeight: 20
              })}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%'
                }}
              >
                边框宽度
              </div>
            </span>
            <TextPX
              onChange={e => {
                const num = Number(e.replace('px', ''))
                if (![null, undefined, ''].includes(e) && Number(num) > 0) {
                  this.handleChangeObj({
                    borderStyle: 'solid',
                    borderWidth: e
                  })
                } else {
                  this.handleChangeObj({
                    borderStyle: 'none',
                    borderWidth: ''
                  })
                }
              }}
              value={style.borderWidth}
            />
          </>
        )}
      </span>
    )
  }
}

Fonter.propTypes = {
  style: PropTypes.object,
  onChange: PropTypes.func.isRequired
}

class TextAlign extends React.Component {
  handleChange = textAlign => {
    const { style, onChange } = this.props
    onChange({
      ...style,
      textAlign
    })
  }

  render() {
    const { style } = this.props

    const { textAlign } = style || {}

    return (
      <span className='gm-printer-edit-text-align'>
        <span
          className={classNames('gm-printer-edit-btn', {
            active: textAlign === 'left'
          })}
          onClick={() => this.handleChange('left')}
        >
          <IconAlign textAlign='left' />
        </span>
        <span
          className={classNames('gm-printer-edit-btn', {
            active: textAlign === 'center'
          })}
          onClick={() => this.handleChange('center')}
        >
          <IconAlign textAlign='center' />
        </span>
        <span
          className={classNames('gm-printer-edit-btn', {
            active: textAlign === 'right'
          })}
          onClick={() => this.handleChange('right')}
        >
          <IconAlign textAlign='right' />
        </span>
      </span>
    )
  }
}

// 边框
const Border = () => {
  return (
    <span>
      <div>123123</div>
    </span>
  )
}

TextAlign.propTypes = {
  style: PropTypes.object,
  onChange: PropTypes.func.isRequired
}

class Position extends React.Component {
  handleChange = (type, value) => {
    const { style, onChange } = this.props

    onChange({
      ...style,
      [type]: value
    })
  }

  render() {
    const {
      style: { top, right, bottom, left }
    } = this.props

    return (
      <span>
        {i18next.t('上')}{' '}
        <TextPX value={top} onChange={this.handleChange.bind(this, 'top')} />
        &nbsp;
        {i18next.t('左')}
        <TextPX value={left} onChange={this.handleChange.bind(this, 'left')} />
        &nbsp;
        {i18next.t('下')}{' '}
        <TextPX
          value={bottom}
          onChange={this.handleChange.bind(this, 'bottom')}
        />
        &nbsp;
        {i18next.t('右')}{' '}
        <TextPX
          value={right}
          onChange={this.handleChange.bind(this, 'right')}
        />
      </span>
    )
  }
}

Position.propTypes = {
  style: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}

class Line extends React.Component {
  handleChange = (type, value) => {
    const { style, onChange } = this.props

    onChange({
      ...style,
      [type]: value
    })
  }

  render() {
    const {
      style: { borderTopWidth, borderTopStyle, borderTopVertical, width }
    } = this.props

    return (
      <span>
        {i18next.t('长度')}
        <TextPX
          value={width}
          onChange={this.handleChange.bind(this, 'width')}
          style={{ width: '35px' }}
        />
        &nbsp;
        {i18next.t('粗细')}
        <TextPX
          value={borderTopWidth}
          onChange={this.handleChange.bind(this, 'borderTopWidth')}
        />
        <select
          value={borderTopStyle}
          onChange={e => this.handleChange('borderTopStyle', e.target.value)}
        >
          {_.map(borderStyleList, v => (
            <option key={v.value} value={v.value}>
              {v.text}
            </option>
          ))}
        </select>
        <select
          value={borderTopVertical}
          onChange={e => this.handleChange('transform', e.target.value)}
        >
          <option value='rotate(0)'>{i18next.t('横线')}</option>
          <option value='rotate(90deg)'>{i18next.t('竖线')}</option>
        </select>
      </span>
    )
  }
}

Line.propTypes = {
  style: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}

class Size extends React.Component {
  handleChange = (type, value) => {
    const { onChange, style } = this.props

    onChange({
      ...style,
      [type]: value
    })
  }

  render() {
    const { style } = this.props
    return (
      <>
        {i18next.t('高')}
        <TextPX
          value={style.height}
          onChange={this.handleChange.bind(this, 'height')}
        />
        &nbsp;{i18next.t('宽')}
        <TextPX
          value={style.width}
          onChange={this.handleChange.bind(this, 'width')}
        />
      </>
    )
  }
}

Size.propTypes = {
  style: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}

class ImageUploader extends React.Component {
  constructor() {
    super()
    this.input = React.createRef()
  }

  handleUpload = event => {
    event.preventDefault()
    // 只上传单张图片
    const droppedFiles = event.dataTransfer
      ? event.dataTransfer.files
      : event.target.files
    const file = droppedFiles[0]

    if (file.size > 512 * 1024) {
      Tip.warning(i18next.t('图片大小不能超过500Kb'))
      return
    }

    if (this.props.uploadQiniuImage) {
      this.props.uploadQiniuImage(file).then(json => {
        this.props.onSuccess(json.data.url)
      })
      return
    }
    const STATION_URL = {
      reqUrl: '/station/image/upload',
      imgUrl: 'http://img.guanmai.cn/station_pic'
    }

    const MANAGE_URL = {
      reqUrl: '/gm_account/image/upload',
      imgUrl: 'http://img.guanmai.cn/report_pic'
    }

    const { hostname } = window.location
    const isStation = /station/g.test(hostname)
    const url = isStation ? STATION_URL : MANAGE_URL

    Request(url.reqUrl)
      .data({
        image_file: file
      })
      .post()
      .then(json => {
        const imgURL = `${url.imgUrl}/${json.data.img_path_id}`
        this.props.onSuccess(imgURL)
      })
  }

  handleClick = () => {
    this.input.current.value = null
    this.input.current.click()
  }

  render() {
    return (
      <>
        <div onClick={this.handleClick} onDrop={this.handleUpload}>
          {this.props.text}
        </div>
        <input
          style={{ display: 'none' }}
          type='file'
          ref={this.input}
          accept='image/*'
          onChange={this.handleUpload}
        />
      </>
    )
  }
}

ImageUploader.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  uploadQiniuImage: PropTypes.func
}

class InputWithUnit extends React.Component {
  handleChange = e => {
    const { value } = e.target
    const { unit, onChange } = this.props
    // 把单位加上
    onChange(value + unit)
  }

  render() {
    const { unit, value, ...rest } = this.props
    const val = value.replace(unit, '')

    return (
      <>
        <input
          {...rest}
          type='number'
          onChange={this.handleChange}
          value={val}
        />
        {unit}
      </>
    )
  }
}

InputWithUnit.propTypes = {
  unit: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired
}

class ColumnWidth extends React.Component {
  handleChange = widthWithUnit => {
    const { style, onChange } = this.props
    const width = parseInt(widthWithUnit) > 0 ? widthWithUnit : 'auto'

    onChange({
      ...style,
      width
    })
  }

  render() {
    const {
      style: { width }
    } = this.props
    return (
      <InputWithUnit
        unit='px'
        value={width || ''}
        onChange={this.handleChange}
        className='gm-printer-edit-input-custom'
      />
    )
  }
}

ColumnWidth.propTypes = {
  style: PropTypes.object,
  onChange: PropTypes.func.isRequired
}

const Hr = () => (
  <div
    style={{
      backgroundColor: '#eee',
      height: '1px',
      margin: '5px 0',
      padding: '0'
    }}
  />
)

class ChangeCapCheckbox extends React.Component {
  render() {
    const {
      value,
      style: { setSpecialUpperCase },
      onChange
    } = this.props
    if (
      value.includes('金额') ||
      value.includes('销售额') ||
      value.includes('运费') ||
      value.includes('税额') ||
      value.includes('成本')
    ) {
      return (
        <Flex style={{ margin: '5px 0 5px 0' }}>
          <Flex alignCenter>
            <input
              type='checkbox'
              checked={setSpecialUpperCase === 'true'}
              onChange={e => {
                const field = value
                  .match(/{{([\s\S].+?)}}/g)[0]
                  // eslint-disable-next-line no-useless-escape
                  ?.replace(/[\{\}]/g, '')
                const [preText, subText] = value.split(`{{${field}}}`)
                const newField = field.includes('_大写')
                  ? field.replace('_大写', '')
                  : field + '_大写'
                onChange('style', {
                  ...this.props.style,
                  setSpecialUpperCase:
                    setSpecialUpperCase === 'true' ? 'false' : 'true'
                })
                onChange('text', `${preText}{{${newField}}}${subText}`)
              }}
            />
          </Flex>
          <Flex>&nbsp;{i18next.t('显示大写金额')}</Flex>
        </Flex>
      )
    } else {
      return <></>
    }
  }
}
ChangeCapCheckbox.propTypes = {
  value: PropTypes.string,
  style: PropTypes.object,
  onChange: PropTypes.func
}
const SubTitle = ({ text }) => (
  <div
    style={{
      backgroundColor: '#eee',
      height: '1px',
      margin: '10px 0 13px 0',
      position: 'relative'
    }}
  >
    <span
      style={{
        position: 'absolute',
        top: '-8px',
        left: '20px',
        padding: '0 5px',
        backgroundColor: '#fff',
        color: '#848586'
      }}
    >
      {text}
    </span>
  </div>
)
SubTitle.propTypes = {
  text: PropTypes.string
}

const Title = ({ title, text }) => (
  <Flex alignCenter className='gm-printer-edit-title'>
    <span>{title}</span>
    <span className='gm-text-12'>{text}</span>
  </Flex>
)
Title.propTypes = {
  title: PropTypes.string,
  text: PropTypes.object
}

const Gap = ({ width = '100%', height = '3px' }) => (
  <div style={{ width, height }} />
)
Gap.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

const FieldBtn = ({ name, onClick, toolTip }) => (
  <Flex alignCenter style={{ width: '50%', margin: '3px 0' }}>
    <span className='gm-printer-edit-plus-btn' onClick={onClick}>
      +
    </span>
    <span className='gm-padding-left-5'>
      {toolTip ? (
        <>
          {name}
          <ToolTip text={toolTip} />
        </>
      ) : (
        name
      )}
    </span>
  </Flex>
)
FieldBtn.propTypes = {
  name: PropTypes.string,
  onClick: PropTypes.func,
  toolTip: PropTypes.string
}

const TipInfo = ({ text, color }) => (
  <Flex style={{ color }} alignCenter className='gm-padding-top-5 gm-text-red'>
    {text}
  </Flex>
)
TipInfo.propTypes = {
  text: PropTypes.string,
  color: PropTypes.string
}

const IsShowCheckBox = props => {
  const { type, checked, onChange } = props
  const text = TYPE_ENUM[type]
  return (
    <>
      <Flex style={{ margin: '5px 0 5px 0' }}>
        <Flex alignCenter>
          <input type='checkbox' checked={checked} onChange={onChange} />
        </Flex>
        <Flex>&nbsp;{text}</Flex>
      </Flex>
    </>
  )
}
IsShowCheckBox.propTypes = {
  onChange: PropTypes.func,
  checked: PropTypes.bool,
  type: PropTypes.string
}

const ShowInputText = props => {
  const { value, onChange, text, type } = props

  const handleChange = e => {
    if (typeof onChange === 'function') onChange(type, e)
  }
  return (
    <Flex className='gm-padding-top-5'>
      <Flex alignCenter>{text}文案：</Flex>
      <Flex alignCenter>
        <input
          className='gm-printer-edit-input-custom'
          type='text'
          value={value}
          onChange={handleChange}
        />
      </Flex>
    </Flex>
  )
}
ShowInputText.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  text: PropTypes.string,
  type: PropTypes.string
}
export {
  Text,
  Textarea,
  TextPX,
  TextAlign,
  Separator,
  ChangeCapCheckbox,
  Fonter,
  Position,
  Line,
  Size,
  ImageUploader,
  InputWithUnit,
  ColumnWidth,
  Hr,
  SubTitle,
  Title,
  Gap,
  FieldBtn,
  TipInfo,
  IsShowCheckBox,
  ShowInputText,
  Border
}
