import { keymap } from 'prosemirror-keymap'
import { liftListItem, sinkListItem, splitListItem } from 'prosemirror-schema-list'
import { Fragment, Node, Schema } from 'prosemirror-model'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faList } from '@fortawesome/free-solid-svg-icons'
import React, { useEffect, useState } from 'react'
import { useEditorEventCallback, useEditorState } from '@nytimes/react-prosemirror'
import { TextSelection, Transaction } from 'prosemirror-state'
import { getNodeFromPosition } from './findNode'

export function createListPlugin(schema: Schema) {
  return keymap({
    Enter: splitListItem(schema.nodes.list_item),
    'Shift-Tab': liftListItem(schema.nodes.list_item),
    Tab: sinkListItem(schema.nodes.list_item)
  })
}

export function ListButton(props: { schema: Schema }) {
  const [isActive, setIsActive] = useState(false)
  const editorState = useEditorState()

  useEffect(() => {
    const node = getNodeFromPosition(editorState.selection.$from, props.schema.nodes.bullet_list.name)
    setIsActive(!!node)
  }, [editorState])

  const onClick = useEditorEventCallback(view => {
    const offset: number = view.state.selection.anchor + 1
    const transaction: Transaction = view.state.tr
    const cell = view.state.schema.nodes.list_item.createAndFill(null, Fragment.empty) as Node
    const bulletList = view.state.schema.nodes.bullet_list.create({}, Fragment.fromArray([cell]))
    if (view.dispatch) {
      view.dispatch(
        transaction
          .insert(view.state.selection.to, bulletList)
          .scrollIntoView()
          .setSelection(TextSelection.near(transaction.doc.resolve(offset)))
      )
      view.focus()
    }
  })

  return (
    <button onClick={onClick} className={classNames({ active: isActive })} data-testid="editor-menu-add-list">
      <FontAwesomeIcon size="lg" icon={faList} className="editor-menu-icon" fixedWidth />
    </button>
  )
}
