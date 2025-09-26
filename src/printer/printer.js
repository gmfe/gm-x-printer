import { getAutoFillingConfig, getDataKey } from '../../src/util'
import i18next from '../../locales'
import React from 'react'
import { reaction } from 'mobx'
import classNames from 'classnames'
import { inject, observer, Provider } from 'mobx-react'
import PropTypes from 'prop-types'
import PrinterStore, { TR_BASE_HEIGHT } from './store'
import Page from './page'
import _ from 'lodash'
import Panel from './panel'
import Table from './table'
import MergePage from './merge_page'

// Header Sign Footer 相对特殊，要单独处理
const Header = props => (
  <Panel {...props} name='header' placeholder={i18next.t('页眉')} />
)

const Sign = props => (
  <Panel
    {...props}
    style={{
      ...props.style,
      position: props?.isAdaptive ? 'relative' : 'absolute',
      left: 0,
      right: 0,
      bottom: props?.isAdaptive ? undefined : 0
      // 开启自适应的话，则重置bottom
    }}
    name='sign'
    placeholder={i18next.t('签名')}
  />
)

Sign.propTypes = {
  style: PropTypes.object,
  isAdaptive: PropTypes.bool
}

const Footer = props => (
  <Panel
    {...props}
    style={{
      ...props.style,
      position: props?.isAdaptive ? 'relative' : 'absolute',
      left: 0,
      right: 0,
      // 开启自适应的话，则重置bottom
      bottom: props?.isAdaptive ? undefined : 0
    }}
    name='footer'
    placeholder={i18next.t('页脚')}
  />
)

Footer.propTypes = {
  style: PropTypes.object,
  isAdaptive: PropTypes.bool
}

@inject('printerStore')
@observer
class Printer extends React.Component {
  constructor(props) {
    super(props)

    // 无实际意义，辅助 onReady，见 didMount
    this.state = {}
    this.init()
  }

  async UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.selected !== this.props.selected) {
      this.props.printerStore.setSelected(nextProps.selected)
    }
    if (nextProps.selectedRegion !== this.props.selectedRegion) {
      this.props.printerStore.setSelectedRegion(nextProps.selectedRegion)
    }
    if (
      !(
        _.isNil(nextProps.showCombineSkuDetail) &&
        _.isNil(nextProps.showIngredientDetail)
      )
    ) {
      if (nextProps.showCombineSkuDetail !== this.props.showCombineSkuDetail) {
        this.props.printerStore.setShowCombineSkuDetail(
          nextProps.showCombineSkuDetail
        )
      }
      if (nextProps.showIngredientDetail !== this.props.showIngredientDetail) {
        this.props.printerStore.setShowIngredientDetail(
          nextProps.showIngredientDetail
        )
      }
      await this.props.printerStore.setLinesPerPage(
        nextProps.linesPerPage || ''
      )
      await this.props.printerStore.setAutofillConfig(nextProps.isAutoFilling)
      this.props.printerStore.computedPages()
    }
    /** @decscription 空白行填充补充 */
    if (
      nextProps.isAutoFilling !== this.props.isAutoFilling ||
      nextProps.linesPerPage !== this.props.linesPerPage
    ) {
      await this.props.printerStore.setLinesPerPage(
        nextProps.linesPerPage || ''
      )
      await this.props.printerStore.setAutofillConfig(nextProps.isAutoFilling)
      await this.props.printerStore.setData(nextProps.data)
      await this.props.printerStore.setReady(true)
      await this.props.printerStore.computedPages()
    }
    if (nextProps.lineheight !== this.props.lineheight) {
      await this.props.getremainpageHeight(
        this.props.printerStore.remainPageHeight
      )
    }
    if (nextProps.updateData !== this.props.updateData) {
      if (this.props.printerStore.isDeliverType) {
        await this.props.printerStore.setLinesPerPage(
          nextProps.linesPerPage || ''
        )
        await this.props.printerStore.setAutofillConfig(nextProps.isAutoFilling)
      }
      this.props.printerStore.setOverallOrder(nextProps.config)
    }
  }

  componentDidMount() {
    const { printerStore, config, getremainpageHeight } = this.props
    const batchPrintConfig = config.batchPrintConfig
    // didMount 代表第一次渲染完成
    // 需要等table计算完成之后，才能计算 pages

    const compute = () => {
      // 连续打印不需要计算
      if (batchPrintConfig !== 2) {
        printerStore.setReady(true)
        if (this.props.printerStore.isDeliverType) {
          this.props.printerStore.setLinesPerPage(config.linesPerPage || '')
          this.props.printerStore.setAutofillConfig(
            config.autoFillConfig?.checked || false
          )
        }
        // 开始计算，获取各种数据
        config?.productionMergeType // productionMergeType有值的时候，是生产打印单，需要合并单元格的，分开计算
          ? printerStore.computedRowTablePages()
          : printerStore.computedPages()
        /** @decscription 空白行填充补充 */
        printerStore.computedPages()
        if (config.autoFillConfig?.checked) {
          this.props.printerStore.setAutofillConfig(
            config.autoFillConfig?.checked || false
          )
          this.props.printerStore.changeTableData()
        }
        // 获取剩余空白高度，传到editor
        getremainpageHeight &&
          getremainpageHeight(printerStore.remainPageHeight)
      }
      // Printer 不是立马就呈现出最终样式，有个过程。这个过程需要时间，什么 ready，不太清楚，估借 setState 来获取过程结束时刻
      this.setState({}, () => {
        // 这里需要等计算完成渲染完成之后
        if (this.props?.printerStore?.isPrintedPageOrderAndTotal) {
          setTimeout(() => {
            this.props.onReady()
          }, 100)
        } else {
          // 这里如果需要计算
          this.props.onReady()
        }
      })
    }
    if (Object.keys(printerStore.tableReady).length === 0) {
      compute()
    } else {
      const disposer = reaction(
        () => printerStore.tableReady,
        tableReady => {
          const tableIsReady = Object.keys(tableReady).every(
            key => tableReady[key]
          )
          if (tableIsReady) {
            compute()
            if (disposer) {
              disposer()
            }
          }
        },
        {
          fireImmediately: true,
          delay: 500
        }
      )
    }
  }

  init() {
    const {
      printerStore,
      config,
      data,
      selected,
      selectedRegion,
      isInPrint
    } = this.props
    printerStore.init(config, data)
    printerStore.setSelected(selected)
    printerStore.setSelectedRegion(selectedRegion)
    printerStore.setIsInPrint(isInPrint)
  }

  renderBefore() {
    const { printerStore } = this.props
    const isDeliverType = this.props?.config?.isDeliverType
    const { config } = printerStore
    return (
      <Page>
        <Header config={config.header} pageIndex={0} />

        {_.map(config.contents, (content, index) => {
          switch (content.type) {
            case 'table': {
              const dataKey = printerStore.isDeliverType
                ? getDataKey(
                    content.dataKey,
                    content.arrange,
                    printerStore.tableVerticalStyle
                  )
                : content.dataKey
              // eslint-disable-next-line no-case-declarations
              const list = printerStore.data._table[dataKey]
              return (
                <Table
                  key={`contents.table.${index}`}
                  name={`contents.table.${index}`}
                  config={content}
                  range={{
                    begin: 0,
                    end: Number(list?.length || 0),
                    size: Number(
                      printerStore.linesPerPage || list?.length || 1
                    ),
                    trueBegin: 0,
                    linesPerPage: printerStore.linesPerPage
                  }}
                  pageIndex={0}
                  isRenderBefore
                  placeholder={`${i18next.t('区域')} ${index}`}
                  isDeliverType={isDeliverType}
                />
              )
            }

            default:
              return (
                <Panel
                  key={`contents.panel.${index}`}
                  name={`contents.panel.${index}`}
                  config={content}
                  pageIndex={0}
                  placeholder={`${i18next.t('区域')} ${index}`}
                />
              )
          }
        })}
        <Sign config={config.sign} pageIndex={0} />
        <Footer config={config.footer} pageIndex={0} />
      </Page>
    )
  }

  renderPage() {
    const { printerStore, isSomeSubtotalTr } = this.props
    const isDeliverType = this.props?.config?.isDeliverType

    const {
      config,
      remainPageHeight,
      isAutoFilling,
      showCombineSkuDetail,
      showIngredientDetail,
      pages
    } = printerStore
    const isAutoFillingBool = getAutoFillingConfig(isAutoFilling) !== 'manual'
    return (
      <>
        {_.map(printerStore.pages, (page, i) => {
          const pagesLength = pages.length - 1
          const isLastPage = i === pagesLength // 最后一页
          const lastSecond = i === pagesLength - 1 // 倒数第二页
          let isLastPageHasTable = false
          const hasTable = arr =>
            _.map(arr, item => item.type).includes('table')
          // 整单合计开启后，仅在最后一页展现,存在最后一页刚好可能没有table的情况，so将整单合计放在倒数第二页的table表格里
          isLastPageHasTable = hasTable(pages?.[pagesLength])
            ? isLastPage
            : lastSecond && hasTable(pages?.[pagesLength - 1])
          return (
            <Page key={i}>
              <Header config={config.header} pageIndex={i} />
              {_.map(page, (panel, ii) => {
                const content = config.contents[panel.index]
                const autoFillConfig = config?.autoFillConfig || {}
                const isAutofillConfig =
                  isLastPage &&
                  isAutoFillingBool &&
                  panel.end &&
                  content?.dataKey === autoFillConfig?.dataKey

                // 如果设置了linesPerPage，则只填充linesPerPage行
                let end = panel.end
                let size = panel.size
                if (isDeliverType) {
                  if (!printerStore.linesPerPage) {
                    size = isAutofillConfig
                      ? panel.size +
                        Math.floor(remainPageHeight / TR_BASE_HEIGHT)
                      : panel.size
                    end = isAutofillConfig
                      ? panel.end +
                        Math.floor(remainPageHeight / TR_BASE_HEIGHT)
                      : panel.end
                  }
                } else {
                  end = isAutofillConfig
                    ? panel.end + Math.floor(remainPageHeight / TR_BASE_HEIGHT)
                    : panel.end
                }

                switch (panel.type) {
                  case 'table': {
                    if (config.contents[panel.index]?.id === 'combine') {
                      // 需不需要展示组合商品table
                      if (!showCombineSkuDetail) {
                        return null
                      } else {
                        // 组合商品table需不需要展示原料
                        if (
                          (showIngredientDetail &&
                            config.contents[panel.index].dataKey ===
                              'combine_withoutIg') ||
                          (!showIngredientDetail &&
                            config.contents[panel.index].dataKey ===
                              'combine_withIg')
                        ) {
                          return null
                        }
                        return (
                          <Table
                            key={`contents.table.${panel.index}.${ii}`}
                            name={`contents.table.${panel.index}`}
                            config={config.contents.find(
                              c =>
                                c.id === 'combine' &&
                                c.dataKey ===
                                  (showIngredientDetail
                                    ? 'combine_withIg'
                                    : 'combine_withoutIg')
                            )}
                            range={{
                              begin: panel.begin,
                              end: end,
                              size: panel.pageSize,
                              page: panel.page,
                              linesPerPage: panel.linesPerPage
                            }}
                            placeholder={`${i18next.t('区域')} ${panel.index}`}
                            pageIndex={i}
                            isAutoFilling={isAutoFilling}
                            isSomeSubtotalTr={isSomeSubtotalTr}
                            isLastPage={isLastPageHasTable}
                            isDeliverType={isDeliverType}
                          />
                        )
                      }
                    } else {
                      return (
                        <Table
                          key={`contents.table.${panel.index}.${ii}`}
                          name={`contents.table.${panel.index}`}
                          config={config.contents[panel.index]}
                          range={{
                            begin: panel.begin,
                            end: end,
                            size: size || printerStore.linesPerPage,
                            trueBegin: panel.trueBegin,
                            pageIndex: panel.pageIndex,
                            linesPerPage:
                              panel.linesPerPage || printerStore.linesPerPage
                          }}
                          isAutoFilling={isAutoFilling}
                          placeholder={`${i18next.t('区域')} ${panel.index}`}
                          pageIndex={i}
                          isSomeSubtotalTr={isSomeSubtotalTr}
                          isLastPage={isLastPageHasTable}
                          isDeliverType={isDeliverType}
                        />
                      )
                    }
                  }

                  default:
                    return (
                      <Panel
                        key={`contents.panel.${panel.index}`}
                        name={`contents.panel.${panel.index}`}
                        config={config.contents[panel.index]}
                        pageIndex={i}
                        placeholder={`${i18next.t('区域')} ${panel.index}`}
                      />
                    )
                }
              })}
              {isLastPage && (
                <Sign
                  config={config.sign}
                  pageIndex={i}
                  style={{ bottom: config.footer.style.height }}
                  isAdaptive={this.props.config?.sign?.isAdaptive}
                />
              )}
              <Footer
                config={config.footer}
                isAdaptive={this.props.config?.footer?.isAdaptive}
                pageIndex={i}
              />
            </Page>
          )
        })}
      </>
    )
  }

  renderMerge() {
    const { printerStore } = this.props
    const { config } = printerStore
    return (
      <MergePage>
        <Header config={config.header} pageIndex={0} />
        {_.map(config.contents, (content, index) => {
          switch (content.type) {
            case 'table':
              // eslint-disable-next-line no-case-declarations
              const list = printerStore.data._table[content.dataKey]
              return (
                <Table
                  key={`contents.table.${index}`}
                  name={`contents.table.${index}`}
                  config={content}
                  range={{ begin: 0, end: list?.length || 0 }}
                  pageIndex={0}
                  placeholder={`${i18next.t('区域')} ${index}`}
                  isDeliverType={this.props.config?.isDeliverType}
                />
              )

            default:
              return (
                <Panel
                  key={`contents.panel.${index}`}
                  name={`contents.panel.${index}`}
                  config={content}
                  pageIndex={0}
                  placeholder={`${i18next.t('区域')} ${index}`}
                />
              )
          }
        })}
        <Sign config={config.sign} pageIndex={0} />
        <Footer config={config.footer} pageIndex={0} />
      </MergePage>
    )
  }

  doRender() {
    const { printerStore, config } = this.props
    // batchPrintConfig: 1 不连续打印（纸张会间断）2 连续打印（纸张连续打，不间断）
    const batchPrintConfig = config.batchPrintConfig
    if (batchPrintConfig === 2) {
      return this.renderMerge()
    } else {
      // renderBefore ，拿到各种数据，哪些模块哪些内容放合适位置，切割表格
      // renderPage，最终渲染打印的页面
      return printerStore.ready ? this.renderPage() : this.renderBefore()
    }
  }

  render() {
    const {
      selected,
      config,
      onReady,
      selectedRegion,
      printerStore,
      ...rest
    } = this.props
    const {
      size: { width },
      className,
      style
    } = printerStore.config.page
    // batchPrintConfig: 1 不连续打印（纸张会间断）2 连续打印（纸张连续打，不间断）
    const batchPrintConfig = config.batchPrintConfig

    return (
      <div
        {...rest}
        className={classNames('gm-printer', className)}
        style={Object.assign({}, style, {
          width,
          breakAfter: batchPrintConfig === 2 ? 'auto' : 'always'
        })}
      >
        {this.doRender()}
      </div>
    )
  }
}

Printer.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  style: PropTypes.object,
  printerStore: PropTypes.object,
  selected: PropTypes.string,
  selectedRegion: PropTypes.string,
  isAutoFilling: PropTypes.bool,
  linesPerPage: PropTypes.string,
  lineheight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  data: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
  onReady: PropTypes.func,
  showCombineSkuDetail: PropTypes.bool,
  showIngredientDetail: PropTypes.bool,
  isSomeSubtotalTr: PropTypes.bool,
  updateData: PropTypes.bool,
  getremainpageHeight: PropTypes.func,
  isInPrint: PropTypes.bool
}

Printer.defaultProps = {
  onReady: _.noop
}

class WithStorePrinter extends React.Component {
  constructor(props) {
    super(props)
    this.printerStore = new PrinterStore(props.batchKey)
  }

  render() {
    return (
      <Provider printerStore={this.printerStore}>
        <Printer {...this.props} />
      </Provider>
    )
  }
}

export default WithStorePrinter
