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
      mode: { default: '' }
    },
    parseDOM: [
      {
        tag: '[data-editor-id=e-formula]',
        getAttrs(dom: HTMLElement) {
          return {
            latex: dom.textContent,
            mode: dom.getAttribute('mode')
          }
        }
      }
    ],
    toDOM(node: Node) {
      const container = document.createElement('img')
      if (node.attrs.latex) {
        container.setAttribute('alt', node.attrs.latex as string)
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
      const container = document.createElement('span')
      container.innerHTML = `<e:formula mode="${node.attrs.mode}">${node.attrs.latex}</e:formula>`
      return container.firstElementChild!
    }
  }
}

export function FormulaButton(props: { setFormulaState: (values: FormulaEditorState) => void }) {
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
    <button onClick={onClick} data-testid="add-formula">
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
