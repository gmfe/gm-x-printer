// ‼️优先初始化语言设置(必须先初始化语言)
import '../locales'
import Editor from './editor'
import EditorPurchase from './editor_purchase'
import EditorStockIn from './editor_stockin'
import EditorStockOut from './editor_stockout'
import EditorSettle from './editor_settle'
import EditorStatement from './editor_statement'
import EditorAccoutStatement from './editor_account_statement'
import EditorAccount from './editor_account'
import EditorBoxLabel from './editor_box_label'
import EditorSaleMenus from './editor_salemenus'
import EditorCannibalize from './editor_cannibalize'
import EditorProduction from './editor_production'
import EditorTicket from './editor_ticket'
import EditorMaterialRequisition from './editor_material_requisition'
import EditorAfterSales from './editor_after_sales'
import EditEshop from './editor_eshop'
import EditorManage from './editor_manage'

import {
  BatchPrinter,
  doBatchPrint,
  renderBatchPrintToDom,
  doPrint,
  Printer,
  getCSS,
  getHtml
} from './printer'
import { MULTI_SUFFIX, DiyTimeType } from './config'

export * from './util'
export { setLocale } from '../locales'

export {
  Editor,
  EditorStockIn,
  EditorStockOut,
  EditorPurchase,
  EditorSettle,
  EditorStatement,
  EditorAccoutStatement,
  EditorAccount,
  EditorBoxLabel,
  EditorSaleMenus,
  EditorCannibalize,
  EditorProduction,
  EditorTicket,
  EditorMaterialRequisition,
  EditorAfterSales,
  EditorManage,
  EditEshop,
  Printer,
  BatchPrinter,
  doPrint,
  doBatchPrint,
  renderBatchPrintToDom,
  getHtml,
  getCSS,
  MULTI_SUFFIX,
  DiyTimeType
}
