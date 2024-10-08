import React, { useContext, useEffect, useState } from 'react'
import { schema as baseSchema } from 'prosemirror-schema-basic'
import { EditorState } from 'prosemirror-state'
import { baseKeymap } from 'prosemirror-commands'
import { GradingInstructionContext } from '../context/GradingInstructionContext'
import { ProseMirror } from '@nytimes/react-prosemirror'
import { DOMParser as ProseDOMParser, DOMSerializer, Schema } from 'prosemirror-model'
import { keymap } from 'prosemirror-keymap'
import { FormulaButton, FormulaEditorState, FormulaPlugin } from './editor/Formula'
import { TableMenu, tablePlugin } from './editor/Table'
import { FormulaPopup } from './editor/FormulaPopup'
import FormatButton from './editor/FormatButton'
import { NbspButton, nbspPlugin } from './editor/NBSP'
import { ImageUploadButton } from './editor/ImageUploadButton'
import { imageInputSchema, imageOutputSchema } from './editor/schemas/imageSchema'
import { CommonExamContext } from '../context/CommonExamContext'
import { faBold, faItalic, faList, faListOl } from '@fortawesome/free-solid-svg-icons'
import { formulaOutputSchema, formulaSchema } from './editor/schemas/formulaSchema'
import { tableSchema } from './editor/schemas/tableSchema'
import { spanWithNowrapSchema } from './editor/schemas/spanWithNowrapSchema'
import { localizationSchema } from './editor/schemas/localizationSchema'
import { listSchema } from './editor/schemas/listSchema'
import { createListPlugin, ListButton } from './editor/List'
import { subSupSchema } from './editor/schemas/subSupSchema'
import { spanWithLangSchema } from './editor/schemas/spanWithLangSchema'

function Menu(props: {
  schema: Schema
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
          <ListButton nodeType={props.schema.nodes.bullet_list} icon={faList} />
          <ListButton nodeType={props.schema.nodes.ordered_list} icon={faListOl} />
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
      .append(listSchema)
      .update('image', imageInputSchema(resolveAttachment))
      .append(localizationSchema(true, 'block'))
      .append(localizationSchema(true, 'inline')),
    marks: baseSchema.spec.marks.append(spanWithNowrapSchema).append(subSupSchema).append(spanWithLangSchema)
  })

  const outputSchema = new Schema({
    nodes: baseSchema.spec.nodes
      .append(formulaOutputSchema)
      .append(tableSchema)
      .append(listSchema)
      .update('image', imageOutputSchema)
      .append(localizationSchema(false, 'block'))
      .append(localizationSchema(false, 'inline')),
    marks: baseSchema.spec.marks.append(spanWithNowrapSchema).append(subSupSchema).append(spanWithLangSchema)
  })

  const doc = ProseDOMParser.fromSchema(inputSchema).parse(element)
  const [mount, setMount] = useState<HTMLElement | null>(null)
  const [formulaState, setFormulaState] = useState<FormulaEditorState | null>(null)
  const formulaPlugin = new FormulaPlugin(setFormulaState)
  const [state, setState] = useState(
    EditorState.create({
      schema: inputSchema,
      doc,
      plugins: [tablePlugin(), createListPlugin(inputSchema), keymap(baseKeymap), formulaPlugin, nbspPlugin]
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
              const fixedHtml = div.innerHTML
                .replace(/&nbsp;/g, '&#160;')
                .replace(/<br>/g, '<br/>')
                .replace(/<hr>/g, '<hr/>')
                .replace(/&amp;gt;/g, '&gt;')
                .replace(/&amp;lt;/g, '&lt;')
              onContentChange(fixedHtml, path)
            }
          }
          return newContent
        })
      }}
    >
      {mount && (
        <Menu
          schema={inputSchema}
          formulaState={formulaState}
          setFormulaState={setFormulaState}
          editorElement={mount}
        />
      )}
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
