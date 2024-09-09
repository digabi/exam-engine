import React, { useContext, useState } from 'react'
import { schema } from 'prosemirror-schema-basic'
import { EditorState } from 'prosemirror-state'
import { toggleMark, baseKeymap } from 'prosemirror-commands'
import { GradingInstructionContext } from '../context/GradingInstructionContext'
import { ProseMirror, useEditorEventCallback } from '@nytimes/react-prosemirror'
import { DOMParser as ProseDOMParser, DOMSerializer } from 'prosemirror-model'
import { keymap } from 'prosemirror-keymap'

function BoldButton() {
  const onClick = useEditorEventCallback(view => {
    const toggleBoldMark = toggleMark(view.state.schema.marks.strong)
    toggleBoldMark(view.state, view.dispatch, view)
  })

  return <button onClick={onClick}>Bold</button>
}

function EditableGradingInstruction({ element }: { element: Element }) {
  const { onContentChange } = useContext(GradingInstructionContext)
  const doc = ProseDOMParser.fromSchema(schema).parse(element)
  const [mount, setMount] = useState<HTMLElement | null>(null)
  const [state, setState] = useState(EditorState.create({ schema, doc, plugins: [keymap(baseKeymap)] }))

  return (
    <ProseMirror
      mount={mount}
      state={state}
      dispatchTransaction={tr => {
        setState(s => s.apply(tr))
        const fragment = DOMSerializer.fromSchema(state.schema).serializeFragment(tr.doc.content)
        const div = document.createElement('div')
        div.appendChild(fragment)
        const path = element.getAttribute('path') ?? ''
        if (onContentChange) {
          onContentChange(div.innerHTML, path)
        }
      }}
    >
      <BoldButton />
      <div ref={setMount} />
    </ProseMirror>
  )
}

export default EditableGradingInstruction
