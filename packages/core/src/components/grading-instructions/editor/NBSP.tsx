import { useEditorEventCallback } from '@nytimes/react-prosemirror'
import React from 'react'
import { createInvisiblesPlugin, nbSpace } from '@guardian/prosemirror-invisibles'

export const nbspPlugin = createInvisiblesPlugin([nbSpace])

export function NbspButton() {
  const onClick = useEditorEventCallback(view => {
    const { state } = view
    if (view.dispatch) {
      const tr = state.tr.insertText('\u00A0')
      view.dispatch(tr)
    }
    view.focus()
    return true
  })

  return (
    <button onClick={onClick} title="sitova välilyönti">
      NBSP
    </button>
  )
}
