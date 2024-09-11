import React, { useContext, useState } from 'react'
import { schema as baseSchema } from 'prosemirror-schema-basic'
import { EditorState } from 'prosemirror-state'
import { baseKeymap } from 'prosemirror-commands'
import { GradingInstructionContext } from '../context/GradingInstructionContext'
import { ProseMirror } from '@nytimes/react-prosemirror'
import { DOMParser as ProseDOMParser, DOMSerializer, Schema } from 'prosemirror-model'
import { keymap } from 'prosemirror-keymap'
import { TableMenu, tableSchema } from './editor/Table'
import FormatButton from './editor/FormatButton'

const schema = new Schema({
  nodes: baseSchema.spec.nodes.append(tableSchema),
  marks: baseSchema.spec.marks
})

function Menu() {
  return (
    <>
      <FormatButton markName="strong" displayName="Bold" />
      <FormatButton markName="em" displayName="Italic" />
      <TableMenu />
    </>
  )
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
      <Menu />
      <div ref={setMount} />
    </ProseMirror>
  )
}

export default EditableGradingInstruction
