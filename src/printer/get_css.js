// eslint-disable-next-line
import normalizeCSS from '!!raw-loader!less-loader!./normalize.css'
// eslint-disable-next-line
import printerCSS from '!!raw-loader!less-loader!./style.less'

function getCSS() {
  return normalizeCSS.toString() + printerCSS.toString()
}

export default getCSS
