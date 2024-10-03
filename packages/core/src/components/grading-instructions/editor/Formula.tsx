import { Plugin, PluginKey, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { AttributeSpec, Fragment, Node, NodeSpec } from 'prosemirror-model'
import { useEditorEventCallback } from '@nytimes/react-prosemirror'
import React from 'react'

export type FormulaEditorState = { pos: number; latex: string; element: Element }

export const formulaSchema: NodeSpec = {
  formula: {
    inline: true,
    group: 'inline',
    atom: true,
    attrs: {
      latex: {},
      mode: { default: '' },
      assistiveTitle: { default: '' }
    },
    parseDOM: [
      {
        tag: '[data-editor-id=e-formula]',
        getAttrs(dom: HTMLElement) {
          return {
            latex: dom.textContent,
            mode: dom.getAttribute('mode'),
            assistiveTitle: dom.getAttribute('assistive-title')
          }
        }
      }
    ],
    toDOM(node: Node) {
      const container = document.createElement('img')
      if (node.attrs.latex) {
        container.setAttribute('alt', node.attrs.latex as string)
        container.setAttribute('formula', 'true')
        container.setAttribute('src', `/math.svg?latex=${encodeURIComponent(node.attrs.latex as string)}`)
      }
      return container
    }
  }
}

export const formulaOutputSchema: NodeSpec = {
  formula: {
    ...(formulaSchema.formula as AttributeSpec),
    toDOM(node: Node) {
      if (!node.attrs.latex) {
        return ''
      }
      const formulaElement = document.createElement('e:formula')
      if (node.attrs.mode) {
        formulaElement.setAttribute('mode', node.attrs.mode as string)
      }
      if (node.attrs.assistiveTitle) {
        formulaElement.setAttribute('assistive-title', node.attrs.assistiveTitle as string)
      }
      formulaElement.textContent = node.attrs.latex as string
      const container = document.createElement('span')
      container.appendChild(formulaElement)
      return container.firstElementChild!
    }
  }
}

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
