import * as React from 'react'
import { EditorSorting, EditorRenderExtraContext } from 'gm-x-printer'

const renderExtra = ({
  isTableColumnSelected,
  selectedColumn,
  setSelectedColumnValue
}: EditorRenderExtraContext) =>
  isTableColumnSelected ? (
    <button onClick={() => setSelectedColumnValue('text', 'inline')}>
      {selectedColumn?.text}
    </button>
  ) : null

export const consumer = (
  <EditorSorting
    config={{}}
    mockData={{}}
    showEditor
    addFields={{}}
    onSave={() => {}}
    renderExtra={renderExtra}
  />
)
