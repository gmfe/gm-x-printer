// eslint-disable-next-line
import normalizeCSS from './normalize.csss'
// eslint-disable-next-line
import printerCSS from './style.lesss'

function getCSS () {
  return normalizeCSS.toString() + printerCSS.toString()
}

export default getCSS
