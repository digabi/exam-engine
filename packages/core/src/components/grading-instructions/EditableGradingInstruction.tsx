import React, { useContext, useEffect, useState } from 'react'
import { schema as baseSchema } from 'prosemirror-schema-basic'
import { EditorState } from 'prosemirror-state'
import { baseKeymap } from 'prosemirror-commands'
import { GradingInstructionContext } from '../context/GradingInstructionContext'
import { ProseMirror } from '@nytimes/react-prosemirror'
import { DOMParser as ProseDOMParser, DOMSerializer, Schema } from 'prosemirror-model'
import { keymap } from 'prosemirror-keymap'
import { FormulaButton, FormulaEditorState, formulaOutputSchema, FormulaPlugin, formulaSchema } from './editor/Formula'
import { TableMenu, tablePlugin, tableSchema } from './editor/Table'
import { FormulaPopup } from './editor/FormulaPopup'
import FormatButton from './editor/FormatButton'
import { NbspButton, nbspPlugin } from './editor/NBSP'
import { spanWithNowrap } from './editor/spanWithNowrap'
import { ImageUploadButton } from './editor/ImageUploadButton'
import { imageInputSchema, imageOutputSchema } from './editor/schemas/image-schema'
import { CommonExamContext } from '../context/CommonExamContext'
import { faBold, faItalic } from '@fortawesome/free-solid-svg-icons'
import { localization } from './editor/localization'

function Menu(props: {
  formulaState: FormulaEditorState | null
  setFormulaState: (values: FormulaEditorState) => void
  editorElement: HTMLElement
}) {
  const { onSaveImage } = useContext(GradingInstructionContext)
  const [isFloating, setIsFloating] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const rect = props.editorElement.getBoundingClientRect()
      if (rect.top < 25 && rect.bottom > 100) {
        setIsFloating(true)
      } else {
        setIsFloating(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      <div className="editor-menu-placeholder">
        <div className={`editor-menu ${isFloating ? 'floating' : ''}`}>
          <FormatButton markName="strong" icon={faBold} />
          <FormatButton markName="em" icon={faItalic} />
          <span className="editor-menu-separator" />
          {onSaveImage && <ImageUploadButton saveImage={onSaveImage} />}
          <span className="editor-menu-separator" />
          <FormulaButton disabled={!!props.formulaState} setFormulaState={props.setFormulaState} />
          <span className="editor-menu-separator" />
          <TableMenu dropdownsBelow={isFloating} />
          <span className="editor-menu-separator" />
          <NbspButton />
        </div>
      </div>
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
    marks: baseSchema.spec.marks.append(spanWithNowrap).append(localization(true))
  })

  const outputSchema = new Schema({
    nodes: baseSchema.spec.nodes.append(formulaOutputSchema).append(tableSchema).update('image', imageOutputSchema),
    marks: baseSchema.spec.marks.append(spanWithNowrap).append(localization(false))
  })

  const doc = ProseDOMParser.fromSchema(inputSchema).parse(element)
  const [mount, setMount] = useState<HTMLElement | null>(null)
  const [formulaState, setFormulaState] = useState<FormulaEditorState | null>(null)
  const formulaPlugin = new FormulaPlugin(setFormulaState)
  const [state, setState] = useState(
    EditorState.create({
      schema: inputSchema,
      doc,
      plugins: [tablePlugin(), keymap(baseKeymap), formulaPlugin, nbspPlugin]
    })
  )

  return (
    <ProseMirror
      mount={mount}
      state={state}
      dispatchTransaction={tr => {
        setState(s => {
          const newContent = s.apply(tr)
          if (tr.docChanged) {
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
          }
          return newContent
        })
      }}
    >
      {mount && <Menu formulaState={formulaState} setFormulaState={setFormulaState} editorElement={mount} />}
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
