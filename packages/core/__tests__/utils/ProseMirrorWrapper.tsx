import React, { ReactNode, useState } from 'react'
import { ProseMirror } from '@nytimes/react-prosemirror'
import { schema } from 'prosemirror-schema-basic'
import { DOMParser as ProseDOMParser } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'

interface WrapperProps {
  children?: ReactNode
  innerHtml?: string
}

const ProseMirrorWrapper: React.FC<WrapperProps> = ({ children, innerHtml = '' }) => {
  const [mount, setMount] = useState<HTMLElement | null>(null)
  const container = document.createElement('div')
  container.innerHTML = innerHtml
  const doc = ProseDOMParser.fromSchema(schema).parse(container)
  const [state, setState] = useState(EditorState.create({ schema, doc }))

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
