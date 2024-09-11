import { useEditorEventCallback, useEditorState } from '@nytimes/react-prosemirror'
import { toggleMark } from 'prosemirror-commands'
import { MarkType } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'
import React, { useEffect, useState } from 'react'

interface Props {
  markName: string
  displayName: string
}

const getMarkType = (state: EditorState, markName: string): MarkType => state.schema.marks[markName]

function FormatButton({ markName, displayName }: Props) {
  const editorState = useEditorState()
  const [isActive, setIsActive] = useState(false)

  const onClick = useEditorEventCallback(view => {
    const { state } = view
    const toggleItalicMark = toggleMark(getMarkType(state, markName))
    toggleItalicMark(state, view.dispatch, view)
    view.focus()
  })

  useEffect(() => {
    const isItalicActive = editorState.storedMarks
      ? getMarkType(editorState, markName).isInSet(editorState.storedMarks)
      : getMarkType(editorState, markName).isInSet(editorState.selection.$from.marks())
    setIsActive(!!isItalicActive)
  }, [editorState])

  return (
    <button onClick={onClick} style={{ fontWeight: isActive ? 'bold' : 'normal' }}>
      {displayName}
    </button>
  )
}

export default FormatButton
