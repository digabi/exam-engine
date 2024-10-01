import React, { useContext, useState } from 'react'
import { schema as baseSchema } from 'prosemirror-schema-basic'
import { EditorState } from 'prosemirror-state'
import { baseKeymap } from 'prosemirror-commands'
import { GradingInstructionContext } from '../context/GradingInstructionContext'
import { ProseMirror } from '@nytimes/react-prosemirror'
import { DOMParser as ProseDOMParser, DOMSerializer, Schema, Node } from 'prosemirror-model'
import { keymap } from 'prosemirror-keymap'
import { FormulaButton, FormulaEditorState, formulaOutputSchema, FormulaPlugin, formulaSchema } from './editor/Formula'
import { TableMenu, tableSchema } from './editor/Table'
import { FormulaPopup } from './editor/FormulaPopup'
import FormatButton from './editor/FormatButton'
import { NbspButton, nbspPlugin } from './editor/NBSP'
import { spanWithNowrap } from './editor/spanWithNowrap'
import { localization } from './editor/localization'
import { CurrentLocalization } from './editor/CurrentLocalization'

const schema = new Schema({
  nodes: baseSchema.spec.nodes.append(formulaSchema).append(tableSchema),
  marks: baseSchema.spec.marks.append(spanWithNowrap).append(localization(true))
})

const outputSchema = new Schema({
  nodes: baseSchema.spec.nodes.append(formulaOutputSchema).append(tableSchema),
  marks: baseSchema.spec.marks.append(spanWithNowrap).append(localization(false))
})

function Menu({
  setFormulaState,
  currentElement
}: {
  setFormulaState: (values: FormulaEditorState) => void
  currentElement: Element | null
}) {
  return (
    <div className="ProseMirror-menu">
      <FormatButton markName="strong" displayName="Bold" />
      <FormatButton markName="em" displayName="Italic" />
      <TableMenu />
      <FormulaButton setFormulaState={setFormulaState} />
      <NbspButton />
      <CurrentLocalization currentElement={currentElement} />
    </div>
  )
}

function EditableGradingInstruction({ element }: { element: Element }) {
  const { onContentChange } = useContext(GradingInstructionContext)
  const doc = ProseDOMParser.fromSchema(schema).parse(element)
  const [mount, setMount] = useState<HTMLElement | null>(null)
  const [formulaState, setFormulaState] = useState<FormulaEditorState | null>(null)
  const formulaPlugin = new FormulaPlugin(setFormulaState)
  const [state, setState] = useState(
    EditorState.create({ schema, doc, plugins: [keymap(baseKeymap), formulaPlugin, nbspPlugin] })
  )
  const [currentElement, setCurrentElement] = useState<Element | null>(null)

  function findElementFromPosition(rootNode: Node | null, pos: number) {
    if (rootNode == null) {
      return null
    }
    const node = rootNode.nodeAt(pos)
    if (!node) {
      return null
    }
    const serializedNode = DOMSerializer.fromSchema(outputSchema).serializeNode(node)
    const element = serializedNode as Element
    if (element.tagName?.toLowerCase() == 'e:localization') {
      return element
    }
    const parent = serializedNode.parentNode as Node | null
    return findElementFromPosition(parent, pos)
  }

  return (
    <ProseMirror
      mount={mount}
      state={state}
      dispatchTransaction={tr => {
        setCurrentElement(findElementFromPosition(tr.doc, tr.selection.from))
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
      <Menu setFormulaState={setFormulaState} currentElement={currentElement} />
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
