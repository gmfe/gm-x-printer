declare module 'gm-x-printer' {
  import { CSSProperties } from 'react'

  interface EditorProps {
    config: any
    mockData: any
    onSave: (config: any, isSaveAs?: boolean) => void
    showEditor: boolean
    addFields: any
  }

  interface PrinterProps {
    data: any
    config: any
    className?: string
    style?: CSSProperties
    selected?: string
    selectedRegion?: string
    onReady?: () => void
  }

  interface BatchPrinterProps {
    list: any[]
    onReady?: () => void
  }

  interface EditorStatementProps extends EditorProps {
    /** 分组，用于控制切换数据展示时显隐 */
    tableFieldsGrouped?: Record<string, any>
  }

  // function Editor<P extends EditorProps>(props: P): React.ComponentType<P>
  class Editor<T extends EditorProps> extends React.Component<T, any> {}

  class EditorStockIn<T extends EditorProps> extends React.Component<T, any> {}

  class EditorStockOut<T extends EditorProps> extends React.Component<T, any> {}

  class EditorPurchase<T extends EditorProps & { hideSheetUnitSummary?: boolean }> extends React.Component<T, any> {}

  class EditorSettle<T extends EditorProps> extends React.Component<T, any> {}

  class EditorSaleMenus<
    T extends EditorProps & {
      /** 是否隐藏组合商品设置 */
      hideCombineSkuSetting?: boolean
    }
  > extends React.Component<T, any> {}

  class EditorAfterSales<T extends EditorProps> extends React.Component<
    T,
    any
  > {}

  class EditorCannibalize<T extends EditorProps> extends React.Component<
    T,
    any
  > {}

  class EditorMaterialRequisition<
    T extends EditorProps
  > extends React.Component<T, any> {}

  class EditorProduction<T extends EditorProps> extends React.Component<
    T,
    any
  > {}

  class EditorStatement<T extends EditorStatementProps> extends React.Component<
    T,
    any
  > {}

  class EditorAccoutStatement<T extends EditorProps> extends React.Component<
    T,
    any
  > {}

  class EditorAccount<T extends EditorProps> extends React.Component<T, any> {}

  class EditorManage<T extends EditorProps> extends React.Component<T, any> {}

  class EditorSupplierSettleSheet<T extends EditorProps> extends React.Component<T, any> {}

  class EditorBoxLabel<T extends EditorProps> extends React.Component<T, any> {}

  class EditEshopOrder<T extends EditorProps> extends React.Component<T, any> {}

  class EditorPurchaseDemand<T extends EditorProps> extends React.Component<
    T,
    any
  > {}

  class EditorSorting<T extends EditorProps> extends React.Component<
    T,
    any
  > {}

  class Printer<T extends PrinterProps> extends React.Component<T, any> {}

  class BatchPrinter<T extends BatchPrinterProps> extends React.Component<
    T,
    any
  > {}

  const MULTI_SUFFIX: string

  function getCSS(): string

  function insertCSS(cssString: string, target?: HTMLElement | ShadowRoot): void

  function doPrint(
    obj: { data: any; config: any },
    isTest?: boolean,
    extraConfig?: {
      isPreview: boolean
      isTipZoom: boolean
      isPrint: boolean
      isElectronPrint?: boolean
    },
    onReady?: () => void
  ): (obj: { data: any; config: any }) => Promise<any>

  function doBatchPrint(
    list: any[],
    isTest?: boolean,
    extraConfig?: {
      isPreview: boolean
      isTipZoom: boolean
      isPrint: boolean
      isElectronPrint?: boolean
    },
    onReady?: () => void
  ): (list: []) => Promise<any>

  /**
   * 用 gm-x-printer 自己的 ReactDOM 把 BatchPrinter 渲染到指定容器（独立 React 树）
   * 适用：umi mfsu 等双 React 实例场景（如 govern_web），不能 JSX 内联渲染 Printer
   */
  function renderBatchPrintToDom(
    list: any[],
    container: HTMLElement,
    extraConfig?: {
      /** 打印态下印章定位块是否渲染（电子签量坐标用） */
      showSealInPrint?: boolean
      /** 渲染完成回调 */
      onReady?: () => void
    }
  ): void

  export {
    Editor,
    EditorStockIn,
    EditorStockOut,
    EditorPurchase,
    EditorSettle,
    EditorCannibalize,
    EditorProduction,
    EditorStatement,
    EditorSaleMenus,
    EditorAccoutStatement,
    EditorAccount,
    EditorBoxLabel,
    EditorManage,
    EditEshopOrder,
    EditorPurchaseDemand,
    Printer,
    BatchPrinter,
    EditorMaterialRequisition,
    EditorAfterSales,
    EditorSorting,
    MULTI_SUFFIX,
    insertCSS,
    getCSS,
    doPrint,
    doBatchPrint,
    renderBatchPrintToDom,
    EditorSupplierSettleSheet
  }
}
