import React from 'react'
import { useEditorEventCallback } from '@nytimes/react-prosemirror'
import { undo, redo, undoDepth, redoDepth } from 'prosemirror-history'
import { faRedo, faUndo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { EditorState } from 'prosemirror-state'

export function UndoRedoButtons({ state }: { state: EditorState }) {
  const onUndo = useEditorEventCallback(view => {
    undo(view.state, view.dispatch)
  })

  const onRedo = useEditorEventCallback(view => {
    redo(view.state, view.dispatch)
  })

  return (
    <>
      <button onClick={onUndo} title="kumoa muutokset" disabled={undoDepth(state) === 0}>
        <FontAwesomeIcon size="lg" icon={faUndo} className="editor-menu-icon" />
      </button>
      <button onClick={onRedo} title="toista muutokset" disabled={redoDepth(state) === 0}>
        <FontAwesomeIcon size="lg" icon={faRedo} className="editor-menu-icon" />
      </button>
    </>
  )
}
