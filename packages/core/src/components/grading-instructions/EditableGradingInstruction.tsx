import React, { useContext, useState } from 'react'
import { schema as baseSchema } from 'prosemirror-schema-basic'
import { EditorState } from 'prosemirror-state'
import { baseKeymap } from 'prosemirror-commands'
import { GradingInstructionContext } from '../context/GradingInstructionContext'
import { ProseMirror } from '@nytimes/react-prosemirror'
import { DOMParser as ProseDOMParser, DOMSerializer, Schema } from 'prosemirror-model'
import { keymap } from 'prosemirror-keymap'
import { FormulaButton, FormulaEditorState, formulaOutputSchema, FormulaPlugin, formulaSchema } from './editor/Formula'
import { TableMenu, tableSchema } from './editor/Table'
import { FormulaPopup } from './editor/FormulaPopup'
import FormatButton from './editor/FormatButton'
import { NbspButton, nbspPlugin } from './editor/NBSP'
import { spanWithNowrap } from './editor/spanWithNowrap'
import { ImageUploadButton } from './editor/ImageUploadButton'
import { imageInputSchema, imageOutputSchema } from './editor/schemas/image-schema'
import { CommonExamContext } from '../context/CommonExamContext'

function Menu(props: { setFormulaState: (values: FormulaEditorState) => void }) {
  const { onSaveImage } = useContext(GradingInstructionContext)
  return (
    <>
      <FormatButton markName="strong" displayName="Bold" />
      <FormatButton markName="em" displayName="Italic" />
      {onSaveImage && <ImageUploadButton saveImage={onSaveImage} />}
      <TableMenu />
      <FormulaButton setFormulaState={props.setFormulaState} />
      <NbspButton />
    </>
  )
}

function EditableGradingInstruction({ element }: { element: Element }) {
  const { onContentChange } = useContext(GradingInstructionContext)
  const { resolveAttachment } = useContext(CommonExamContext)

  const inputSchema = new Schema({
    nodes: baseSchema.spec.nodes
      .append(formulaSchema)
      .append(tableSchema)
      .update('image', imageInputSchema(resolveAttachment)),
    marks: baseSchema.spec.marks.append(spanWithNowrap)
  })

  const outputSchema = new Schema({
    nodes: baseSchema.spec.nodes.append(formulaOutputSchema).append(tableSchema).update('image', imageOutputSchema),
    marks: baseSchema.spec.marks.append(spanWithNowrap)
  })

  const doc = ProseDOMParser.fromSchema(inputSchema).parse(element)
  const [mount, setMount] = useState<HTMLElement | null>(null)
  const [formulaState, setFormulaState] = useState<FormulaEditorState | null>(null)
  const formulaPlugin = new FormulaPlugin(setFormulaState)
  const [state, setState] = useState(
    EditorState.create({ schema: inputSchema, doc, plugins: [keymap(baseKeymap), formulaPlugin, nbspPlugin] })
  )

  return (
    <ProseMirror
      mount={mount}
      state={state}
      dispatchTransaction={tr => {
        setState(s => s.apply(tr))
        const fragment = DOMSerializer.fromSchema(outputSchema).serializeFragment(tr.doc.content)
        const div = document.createElement('div')
        div.appendChild(fragment)
        const path = element.getAttribute('path') ?? ''
        if (onContentChange) {
          const nbspFixed = div.innerHTML
            .replace(/&nbsp;/g, '&#160;')
            .replace(/<br>/g, '<br/>')
            .replace(/<hr>/g, '<hr/>')
          onContentChange(nbspFixed, path)
        }
      }}
    >
      <Menu setFormulaState={setFormulaState} />
      <div ref={setMount} />

      {formulaState && (
        <FormulaPopup
          state={formulaState}
          onFinish={() => {
            setFormulaState(null)
          }}
        />
      )}
    </ProseMirror>
  )
}

export default EditableGradingInstruction
