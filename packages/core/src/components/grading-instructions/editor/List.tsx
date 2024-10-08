import { keymap } from 'prosemirror-keymap'
import { liftListItem, sinkListItem, splitListItem } from 'prosemirror-schema-list'
import { Fragment, Node, NodeType, Schema } from 'prosemirror-model'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/free-solid-svg-icons'
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

export function ListButton(props: { nodeType: NodeType; icon: IconDefinition }) {
  const [isActive, setIsActive] = useState(false)
  const editorState = useEditorState()

  useEffect(() => {
    const node = getNodeFromPosition(editorState.selection.$from, props.nodeType.name)
    setIsActive(!!node)
  }, [editorState])

  const onClick = useEditorEventCallback(view => {
    const offset: number = view.state.selection.anchor + 1
    const transaction: Transaction = view.state.tr
    const cell = view.state.schema.nodes.list_item.createAndFill(null, Fragment.empty) as Node
    const sss =
      props.nodeType.name === 'bullet_list' ? view.state.schema.nodes.bullet_list : view.state.schema.nodes.ordered_list
    const list = sss.create({}, Fragment.fromArray([cell]))
    if (view.dispatch) {
      view.dispatch(
        transaction
          .insert(view.state.selection.to, list)
          .scrollIntoView()
          .setSelection(TextSelection.near(transaction.doc.resolve(offset)))
      )
      view.focus()
    }
  })

  return (
    <button
      onClick={onClick}
      className={classNames({ active: isActive })}
      data-testid={`editor-menu-add-${props.nodeType.name}`}
    >
      <FontAwesomeIcon size="lg" icon={props.icon} className="editor-menu-icon" fixedWidth />
    </button>
  )
}
