// eslint-disable-next-line
import normalizeCSS from '!!raw-loader!less-loader!./normalize.css'
// eslint-disable-next-line
import printerCSS from '!!raw-loader!less-loader!./style.less'

function getCSS() {
  // 印章定位块兜底：打印时隐藏（防 isInPrint 未注入到 Block）
  const sealPrintHideCSS =
    '@media print { .seal-block{ display: none !important; } }'
  return normalizeCSS.toString() + printerCSS.toString() + sealPrintHideCSS
}

export default getCSS
