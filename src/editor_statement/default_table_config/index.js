import { TABLE_TYPE } from '../table_type'
import orders from './orders'
import orderType from './order_type'
import product from './product'
import skus from './skus'

const defaultTableConfigRecord = {
  [TABLE_TYPE.ORDERS]: orders,
  [TABLE_TYPE.ORDER_TYPE]: orderType,
  [TABLE_TYPE.PRODUCT]: product,
  [TABLE_TYPE.SKUS]: skus
}

export default defaultTableConfigRecord
