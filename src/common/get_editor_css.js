// eslint-disable-next-line
import editorCSS from '!!raw-loader!less-loader!./style.less'

export default function getEditorCSS() {
  return editorCSS.toString()
}
