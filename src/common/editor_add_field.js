import i18next from '../../locales'
import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Gap, SubTitle, Title, FieldBtn } from '../common/component'
import { Flex } from '../components'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'

class FieldList extends React.Component {
  render() {
    const { fields, handleAddField } = this.props
    return (
      <div>
        <Title title={i18next.t('添加字段')} />
        <Gap />
        {_.map(fields, (arr, groupName) => {
          return (
            <Fragment key={groupName}>
              <SubTitle text={groupName} />
              <Flex wrap>
                {_.map(arr, o => (
                  <FieldBtn
                    key={o.key}
                    name={o.key}
                    onClick={handleAddField.bind(this, o)}
                    toolTip={o.toolTip}
                  />
                ))}
              </Flex>
            </Fragment>
          )
        })}
      </div>
    )
  }
}

FieldList.propTypes = {
  fields: PropTypes.object.isRequired,
  handleAddField: PropTypes.func
}

@inject('editStore')
@observer
class EditorAddField extends React.Component {
  render() {
    const {
      addFields: { tableFields, commonFields, ...rest },
      editStore
    } = this.props

    let content = null
    if (editStore.selectedRegion === null || editStore.isSelectingCombine) {
      content = null
    } else if (editStore.computedRegionIsTable) {
      const dataKey = editStore.selectedTableDataKey
      let fields = rest?.[dataKey] ?? tableFields
      // 商品横向表：字段集合切为 ERP 注入的白名单集合
      if (
        editStore.computedTableBodyType === 'horizontal_product' &&
        this.props.addFields.horizontalProductFields
      ) {
        fields = this.props.addFields.horizontalProductFields
      }
      content = (
        <FieldList fields={fields} handleAddField={editStore.addFieldToTable} />
      )
    } else {
      content = (
        <FieldList
          fields={commonFields}
          handleAddField={editStore.addFieldToPanel}
        />
      )
    }

    return <div className='gm-overflow-y'>{content}</div>
  }
}

EditorAddField.propTypes = {
  addFields: PropTypes.object.isRequired,
  editStore: PropTypes.object
}

export default EditorAddField
