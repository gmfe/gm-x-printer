import React from 'react'
import ReactDOM from 'react-dom'
import Printer from './printer'
import getCSS from './get_css'
import BatchPrinter from './batch_printer'
import { isZoom2 } from 'gm-util'
import { afterImgAndSvgLoaded } from '../util'
import ReactDOMServer from 'react-dom/server'

const printerId = '_gm-printer_' + Math.random()
let $printer = window.document.getElementById(printerId)
let doc

function init({ isTest, isPreview, isElectronPrint, isTipZoom = true }) {
  isTipZoom &&
    isZoom2() &&
    window.alert(
      '检测您的浏览器使用了缩放,为了避免影响打印布局,请使用快捷键 ctrl + 0 重置缩放到100%后再进行打印'
    )

  const createElement = () => {
    const style = doc.createElement('style')
    style.type = 'text/css'
    style.appendChild(doc.createTextNode(getCSS()))
    doc.head.appendChild(style)

    const div = doc.createElement('div')
    div.id = 'appContainer'
    if (isPreview) {
      div.className = 'gm-preview'
    }

    doc.body.appendChild(div)
  }

  // 如果是electron打印，不能创建 iframe，否则electron 打印时尺寸会不对
  if (isElectronPrint) {
    if (!doc) {
      doc = document
      createElement()
    }
  } else {
    if (!$printer) {
      $printer = window.document.createElement('iframe')
      $printer.id = printerId
      $printer.style.position = 'fixed'
      $printer.style.top = '0'
      $printer.frameborder = '0'
      $printer.style.border = 'none'
      $printer.style.width = '100%' // 使移动端可滚动
      if (isTest) {
        // 模板编辑[测试打印],隐藏起来
        $printer.style.left = '-3000px'
      } else {
        $printer.style.left = '0px'
        $printer.style.height = '100vh'
      }
      window.document.body.appendChild($printer)

      const idocument = $printer.contentDocument
      idocument.open()
      idocument.write('<!DOCTYPE html><html><head></head><body></body></html>')
      idocument.close()

      doc = $printer.contentWindow.document
      createElement()
    }
  }
}

function toDoPrint({ data, config, isPrint = true, onReady, isElectronPrint }) {
  return new window.Promise(resolve => {
    let $app
    if (isElectronPrint) {
      $app = document.getElementById('appContainer')
    } else {
      $app = $printer.contentWindow.document.getElementById('appContainer')
    }
    ReactDOM.unmountComponentAtNode($app)
    ReactDOM.render(
      <Printer
        config={config}
        data={data}
        onReady={() => {
          afterImgAndSvgLoaded(() => {
            if (isPrint) {
              $printer.contentWindow.print()
            }
            onReady && onReady()
            resolve()
          }, $app)
        }}
      />,
      $app
    )
  })
}

function toDoPrintBatch(list, isPrint = true, onReady, isElectronPrint) {
  return new window.Promise(resolve => {
    let $app
    if (isElectronPrint) {
      $app = document.getElementById('appContainer')
    } else {
      $app = $printer.contentWindow.document.getElementById('appContainer')
    }

    ReactDOM.unmountComponentAtNode($app)
    ReactDOM.render(
      <BatchPrinter
        list={list}
        onReady={() => {
          afterImgAndSvgLoaded(() => {
            if (isPrint) {
              $printer.contentWindow.print()
            }
            onReady && onReady()
            resolve()
          }, $app)
        }}
      />,
      $app
    )
  })
}

function doPrint({ data, config }, isTest, extraConfig, onReady) {
  init({
    isTest,
    isElectronPrint: extraConfig?.isElectronPrint,
    isPreview: extraConfig?.isPreview,
    isTipZoom: extraConfig?.isTipZoom
  })

  return toDoPrint({
    data,
    config,
    isPrint: extraConfig?.isPrint,
    isElectronPrint: extraConfig?.isElectronPrint,
    onReady
  })
}

function doBatchPrint(
  list,
  isTest,
  extraConfig = {
    isPreview: false,
    isTipZoom: true,
    isPrint: true,
    isElectronPrint: false
  },
  onReady
) {
  init({
    isTest,
    isElectronPrint: extraConfig.isElectronPrint,
    isPreview: extraConfig.isPreview,
    isTipZoom: extraConfig.isTipZoom
  })

  return toDoPrintBatch(
    list,
    extraConfig.isPrint && !extraConfig.isPreview,
    onReady,
    extraConfig.isElectronPrint
  )
}

function renderBatchPrintToDom(list, container) {
  // ReactDOM.unmountComponentAtNode(container)
  ReactDOM.render(<BatchPrinter list={list} />, container)
}

function getHtml(list) {
  return ReactDOMServer.renderToString(<BatchPrinter list={list} />)
}

export { doPrint, doBatchPrint, getHtml, renderBatchPrintToDom }
