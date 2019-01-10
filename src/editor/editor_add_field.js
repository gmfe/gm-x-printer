import i18next from '../../locales'
import React, { Fragment } from 'react'
import { Flex } from 'react-gm'
import { Gap, SubTitle, Title } from './component'
import _ from 'lodash'
import editStore from './store'
import { observer } from 'mobx-react'

const commonFields = {
  [i18next.t('基础')]: [
    { key: i18next.t('下单时间'), value: i18next.t('{{下单时间}}') },
    { key: i18next.t('配送时间'), value: i18next.t('{{配送时间}}') },
    { key: i18next.t('打印时间'), value: i18next.t('{{当前时间}}') },
    { key: i18next.t('订单号'), value: i18next.t('{{订单号}}') },
    { key: i18next.t('分拣序号'), value: i18next.t('{{分拣序号}}') },
    { key: i18next.t('订单备注'), value: i18next.t('{{订单备注}}') },
    { key: i18next.t('结款方式'), value: i18next.t('{{结款方式}}') },
    { key: i18next.t('销售经理'), value: i18next.t('{{销售经理}}') },
    { key: i18next.t('销售经理电话'), value: i18next.t('{{销售经理电话}}') },
    { key: i18next.t('下单总数(销售单位)'), value: i18next.t('{{下单总数_销售单位}}') },
    { key: i18next.t('出库总数(销售单位)'), value: i18next.t('{{出库总数_销售单位}}') }
  ],
  [i18next.t('配送')]: [
    { key: i18next.t('线路'), value: i18next.t('{{线路}}') },
    { key: i18next.t('收货商户'), value: i18next.t('{{收货商户}}({{商户ID}})') },
    { key: i18next.t('收货人'), value: i18next.t('{{收货人}}') },
    { key: i18next.t('收货人电话'), value: i18next.t('{{收货人电话}}') },
    { key: i18next.t('收货地址'), value: i18next.t('{{收货地址}}') },
    { key: i18next.t('地理标签'), value: i18next.t('{{城市}}{{城区}}{{街道}}') },
    { key: i18next.t('商户公司'), value: i18next.t('{{商户公司}}') },
    { key: i18next.t('承运商'), value: i18next.t('{{承运商}}') },
    { key: i18next.t('司机名称'), value: i18next.t('{{司机名称}}') },
    { key: i18next.t('司机电话'), value: i18next.t('{{司机电话}}') }

  ],
  [i18next.t('金额')]: [
    { key: i18next.t('下单金额'), value: i18next.t('{{下单金额}}') },
    { key: i18next.t('出库金额'), value: i18next.t('{{出库金额}}') },
    { key: i18next.t('运费'), value: i18next.t('{{运费}}') },
    { key: i18next.t('异常金额'), value: i18next.t('{{异常金额}}') },
    { key: i18next.t('销售额(含运税)'), value: i18next.t('{{销售额_含运税}}') },
    { key: i18next.t('税额'), value: i18next.t('{{税额}}') }
  ],
  [i18next.t('其他')]: [
    { key: i18next.t('页码'), value: i18next.t('{{当前页码}} / {{页码总数}}') }
  ]
}

const tableFields = {
  [i18next.t('基础')]: [
    { key: i18next.t('序号'), value: i18next.t('{{列.序号}}') },
    { key: i18next.t('商品ID'), value: i18next.t('{{列.商品ID}}') },
    { key: i18next.t('商品名'), value: i18next.t('{{列.商品名}}') },
    { key: i18next.t('类别'), value: i18next.t('{{列.类别}}') },
    { key: i18next.t('商品二级分类'), value: i18next.t('{{列.商品二级分类}}') },
    { key: i18next.t('商品品类'), value: i18next.t('{{列.商品品类}}') },
    { key: i18next.t('SPU名称'), value: i18next.t('{{列.SPU名称}}') },
    { key: i18next.t('规格'), value: i18next.t('{{列.规格}}') },
    { key: i18next.t('税率'), value: i18next.t('{{列.税率}}') },
    { key: i18next.t('自定义编码'), value: i18next.t('{{列.自定义编码}}') },
    { key: i18next.t('商品描述'), value: i18next.t('{{列.商品描述}}') },
    { key: i18next.t('备注'), value: i18next.t('{{列.备注}}') },
    { key: i18next.t('自定义'), value: '' }
  ],
  [i18next.t('价格')]: [
    { key: i18next.t('不含税单价(基本单位)'), value: i18next.t('{{列.不含税单价_基本单位}}') },
    { key: i18next.t('不含税单价(销售单位)'), value: i18next.t('{{列.不含税单价_销售单位}}') },
    { key: i18next.t('单价(基本单位)'), value: i18next.t('{{列.单价_基本单位}}') },
    { key: i18next.t('单价(销售单位)'), value: i18next.t('{{列.单价_销售单位}}') }
  ],
  [i18next.t('数量')]: [
    { key: i18next.t('下单数'), value: i18next.t('{{列.下单数}}{{列.销售单位}}') },
    { key: i18next.t('出库数(基本单位)'), value: i18next.t('{{列.出库数_基本单位}}{{列.基本单位}}') },
    { key: i18next.t('出库数(销售单位)'), value: i18next.t('{{列.出库数_销售单位}}{{列.销售单位}}') }
  ],
  [i18next.t('金额')]: [
    { key: i18next.t('商品税额'), value: i18next.t('{{列.商品税额}}') },
    { key: i18next.t('出库金额'), value: i18next.t('{{列.出库金额}}') },
    { key: i18next.t('出库金额(不含税)'), value: i18next.t('{{列.出库金额_不含税}}') }
  ],
  [i18next.t('异常')]: [
    { key: i18next.t('异常原因'), value: i18next.t('{{列.异常原因}}') },
    { key: i18next.t('异常描述'), value: i18next.t('{{列.异常描述}}') },
    { key: i18next.t('异常数量'), value: i18next.t('{{列.异常数量}}') },
    { key: i18next.t('异常金额'), value: i18next.t('{{列.异常金额}}') }

  ]
}

const FieldBtn = ({ name, onClick }) => (
  <Flex alignCenter style={{ width: '50%', margin: '3px 0' }}>
    <span className='gm-printer-edit-plus-btn' onClick={onClick}>
      +
    </span>
    <span className='gm-padding-left-5'>{name}</span>
  </Flex>
)

class FieldList extends React.Component {
  render () {
    const { fields, handleAddField } = this.props
    return (
      <div>
        <Title title={i18next.t('添加字段')}/>
        <Gap/>
        {_.map(fields, (arr, groupName) => {
          return (
            <Fragment key={groupName}>
              <SubTitle text={groupName}/>
              <Flex wrap>
                {_.map(arr, o => <FieldBtn key={o.key} name={o.key} onClick={handleAddField.bind(this, o)}/>)}
              </Flex>
            </Fragment>
          )
        })}
      </div>
    )
  }
}

@observer
class EditorAddField extends React.Component {
  render () {
    let content = null
    if (editStore.selectedRegion === null) {
      content = null
    } else if (editStore.computedRegionIsTable) {
      content = <FieldList fields={tableFields} handleAddField={editStore.addFieldToTable}/>
    } else {
      content = <FieldList fields={commonFields} handleAddField={editStore.addFieldToPanel}/>
    }

    return <div className='gm-overflow-y'>{content}</div>
  }
}

export default EditorAddField