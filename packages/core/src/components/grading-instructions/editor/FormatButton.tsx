import { useEditorEventCallback, useEditorState } from '@nytimes/react-prosemirror'
import { toggleMark } from 'prosemirror-commands'
import { MarkType } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'
import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface Props {
  markName: string
  icon?: IconDefinition
}

const getMarkType = (state: EditorState, markName: string): MarkType => state.schema.marks[markName]

function FormatButton({ markName, icon }: Props) {
  const editorState = useEditorState()
  const [isActive, setIsActive] = useState(false)

  const onClick = useEditorEventCallback(view => {
    const { state } = view
    const toggleFormatMark = toggleMark(getMarkType(state, markName))
    toggleFormatMark(state, view.dispatch, view)
    view.focus()
  })

  useEffect(() => {
    const isTextFormatActive = editorState.storedMarks
      ? getMarkType(editorState, markName).isInSet(editorState.storedMarks) // is next input going to be marked?
      : getMarkType(editorState, markName).isInSet(editorState.selection.$to.marks()) // is current input marked?
    setIsActive(!!isTextFormatActive)
  }, [editorState])

  return (
    <button onClick={onClick} className={classNames({ active: isActive })}>
      <FontAwesomeIcon size="lg" className="editor-menu-icon" icon={icon!} />
    </button>
  )
}

export default FormatButton
