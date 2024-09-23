import React from 'react'
import { useEditorEventCallback } from '@nytimes/react-prosemirror'
import { FormulaEditorState } from './Formula'
import { Popup } from '../../shared/Popup'

export function FormulaPopup({ state, onFinish }: { state: FormulaEditorState; onFinish: () => void }) {
  const onValueChange = (text: string) => {
    if (text.length && !containsOnlyOneImgTag(text)) {
      return 'Ainoastaan yksi kaava sallittu'
    }
    return null
  }

  const onContentChange = useEditorEventCallback((view, textField: string) => {
    const node = view.state.doc.nodeAt(state.pos)
    const latex = extractLatex(textField) || ''
    const { schema } = view.state

    if (node) {
      const tr = view.state.tr.replaceWith(
        state.pos,
        state.pos + node.nodeSize,
        schema.node('formula', { ...node.attrs, ...{ latex } })
      )
      view.dispatch(tr)
    }
    onFinish()
  })

  const onDelete = useEditorEventCallback(view => {
    const node = view.state.doc.nodeAt(state.pos)
    if (node) {
      const tr = view.state.tr.delete(state.pos, state.pos + node.nodeSize)
      view.dispatch(tr)
    }
    onFinish()
  })

  return (
    <Popup
      element={state.element}
      initialTextContent={
        state.latex.length ? `<img alt="${state.latex}" src="/math.svg?latex=${encodeURIComponent(state.latex)}">` : ''
      }
      onValueChange={onValueChange}
      onValueSave={onContentChange}
      enableDelete={true}
      onDelete={onDelete}
      onCancel={() => {
        if (!state.latex.length) {
          onDelete()
        }
        onFinish()
      }}
    />
  )
}

function extractLatex(value: string) {
  const latexPattern = /alt="([^&]+)" src=/
  const latexMatch = value.match(latexPattern)

  if (!latexMatch || latexMatch.length < 2) {
    return
  }

  return decodeURIComponent(latexMatch[1])
}

function containsOnlyOneImgTag(htmlString: string) {
  const imgTagPattern = /^<img\s+[^>]*>$/g
  const matches = htmlString.trim().match(imgTagPattern)
  return matches && matches.length === 1
}
