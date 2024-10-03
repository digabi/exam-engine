import { Plugin, PluginKey, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Fragment } from 'prosemirror-model'
import { useEditorEventCallback } from '@nytimes/react-prosemirror'
import React from 'react'

export type FormulaEditorState = { pos: number; latex: string; element: Element }

export function FormulaButton(props: { disabled: boolean; setFormulaState: (values: FormulaEditorState) => void }) {
  const onClick = useEditorEventCallback(view => {
    const transaction: Transaction = view.state.tr
    const formula = view.state.schema.nodes.formula.create({ latex: '' }, Fragment.empty)
    if (view.dispatch) {
      view.dispatch(transaction.insert(view.state.selection.to, formula).scrollIntoView())

      const pos = view.state.selection.to - formula.nodeSize
      const element = view.nodeDOM(pos)
      if (element instanceof Element) {
        props.setFormulaState({ pos, latex: '', element })
      }
    }
  })

  return (
    <button onClick={onClick} data-testid="add-formula" disabled={props.disabled}>
      Lisää kaava
    </button>
  )
}

export class FormulaPlugin extends Plugin {
  constructor(updateFormulaState: (values: FormulaEditorState) => void) {
    super({
      key: new PluginKey('Formula'),
      props: {
        handleClick(view: EditorView, pos: number) {
          const { state } = view
          const node = state.doc.nodeAt(pos)
          if (node && node.type.name === 'formula') {
            const domNode = view.nodeDOM(pos)
            if (domNode instanceof Element) {
              updateFormulaState({ pos, element: domNode, latex: node.attrs.latex as string })
              return true
            }
          }
          return false
        }
      }
    })
  }
}
