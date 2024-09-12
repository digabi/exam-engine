import React, { ReactNode, useState } from 'react'
import { ProseMirror } from '@nytimes/react-prosemirror'
import { schema } from 'prosemirror-schema-basic'
import { EditorState } from 'prosemirror-state'

interface WrapperProps {
  children: ReactNode
}

const ProseMirrorWrapper: React.FC<WrapperProps> = ({ children }) => {
  const [mount, setMount] = useState<HTMLElement | null>(null)
  const [state, setState] = useState(EditorState.create({ schema }))

  return (
    <ProseMirror
      state={state}
      mount={mount}
      dispatchTransaction={tr => {
        setState(s => s.apply(tr))
      }}
    >
      <div ref={setMount} />
      {children}
    </ProseMirror>
  )
}

export default ProseMirrorWrapper
