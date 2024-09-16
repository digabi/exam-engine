import React, { useContext, useState } from 'react'
import { schema as baseSchema } from 'prosemirror-schema-basic'
import { EditorState } from 'prosemirror-state'
import { baseKeymap } from 'prosemirror-commands'
import { GradingInstructionContext } from '../context/GradingInstructionContext'
import { ProseMirror } from '@nytimes/react-prosemirror'
import { DOMParser as ProseDOMParser, Schema } from 'prosemirror-model'
import { keymap } from 'prosemirror-keymap'
import { TableMenu, tableSchema } from './editor/Table'
import FormatButton from './editor/FormatButton'
import { ImageUploadButton } from './editor/ImageUploadButton'
import { extendedImageNode } from './editor/schemas/image-schema'
import { CommonExamContext } from '../context/CommonExamContext'
import { serializeFragment } from './editor/util'

function Menu() {
  return (
    <>
      <FormatButton markName="strong" displayName="Bold" />
      <FormatButton markName="em" displayName="Italic" />
      <ImageUploadButton />
      <TableMenu />
    </>
  )
}

function EditableGradingInstruction({ element }: { element: Element }) {
  const { onContentChange } = useContext(GradingInstructionContext)
  const { resolveAttachment } = useContext(CommonExamContext)

  const schema = new Schema({
    nodes: baseSchema.spec.nodes.append(tableSchema).update('image', extendedImageNode(resolveAttachment)),
    marks: baseSchema.spec.marks
  })

  const doc = ProseDOMParser.fromSchema(schema).parse(element)
  const [mount, setMount] = useState<HTMLElement | null>(null)
  const [state, setState] = useState(EditorState.create({ schema, doc, plugins: [keymap(baseKeymap)] }))

  return (
    <ProseMirror
      mount={mount}
      state={state}
      dispatchTransaction={tr => {
        setState(s => s.apply(tr))
        const fragment = serializeFragment(schema, tr.doc.content)
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
