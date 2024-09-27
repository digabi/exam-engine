import { addColumnAfter, addRowAfter, deleteColumn, deleteRow, deleteTable, tableNodes } from 'prosemirror-tables'
import { Fragment, Node, NodeSpec } from 'prosemirror-model'
import React, { useState } from 'react'
import { useEditorEventCallback } from '@nytimes/react-prosemirror'
import { EditorState, TextSelection, Transaction } from 'prosemirror-state'
import { faTable } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { EditorView } from 'prosemirror-view'

const defaultSchema = tableNodes({
  tableGroup: 'block',
  cellContent: 'inline*',
  cellAttributes: { class: { default: '' } }
})

export const tableSchema: NodeSpec = {
  ...defaultSchema,
  table: {
    ...defaultSchema.table,
    parseDOM: [
      {
        tag: 'table',
        getAttrs: (dom: HTMLElement) => ({ class: dom.getAttribute('class') })
      }
    ],
    attrs: { class: { default: '' } },
    toDOM(node: Node) {
      const classNames = (node.attrs.class as string) || undefined
      return [
        'table',
        {
          class: classNames
        },
        ['tbody', 0]
      ]
    }
  },
  table_cell: {
    ...defaultSchema.table_cell,
    parseDOM: [
      {
        tag: 'td',
        getAttrs: (dom: HTMLElement) => ({ class: dom.getAttribute('class') })
      }
    ],
    toDOM(node: Node) {
      const classNames = (node.attrs.class as string) || undefined
      return ['td', { class: classNames }, 0]
    }
  }
}

export function TableMenu() {
  const withFocus = (
    view: EditorView,
    action: (state: EditorState, dispatch?: (tr: Transaction) => void) => boolean
  ) => {
    const result = action(view.state, view.dispatch)
    view.focus()
    return result
  }

  const menuOptions = {
    addTable: {
      title: 'Lisää taulukko',
      onClick: useEditorEventCallback(view => {
        const offset: number = view.state.selection.anchor + 1
        const transaction: Transaction = view.state.tr
        const cell = view.state.schema.nodes.table_cell.createAndFill(null, Fragment.empty) as Node
        const row = view.state.schema.nodes.table_row.create(null, Fragment.fromArray([cell, cell]))
        const table = view.state.schema.nodes.table.create(
          { class: 'e-table e-width-half' },
          Fragment.fromArray([row, row])
        )

        if (view.dispatch) {
          view.dispatch(
            transaction
              .replaceSelectionWith(table)
              .scrollIntoView()
              .setSelection(TextSelection.near(transaction.doc.resolve(offset)))
          )
          view.focus()
        }
        return true
      })
    },
    addColumnAfter: {
      title: 'Lisää sarake',
      onClick: useEditorEventCallback(view => withFocus(view, addColumnAfter))
    },
    addRowAfter: {
      title: 'Lisää rivi',
      onClick: useEditorEventCallback(view => withFocus(view, addRowAfter))
    },
    deleteColumn: {
      title: 'Poista sarake',
      onClick: useEditorEventCallback(view => withFocus(view, deleteColumn))
    },
    deleteRow: {
      title: 'Poista rivi',
      onClick: useEditorEventCallback(view => withFocus(view, deleteRow))
    },
    deleteTable: {
      title: 'Poista taulukko',
      onClick: useEditorEventCallback(view => withFocus(view, deleteTable))
    },
    setFullWidth: {
      title: 'Täysi leveys',
      onClick: useEditorEventCallback(view => changeWidthClass(view, 'e-width-full'))
    },
    setHalfWidth: {
      title: 'Puolikas leveys',
      onClick: useEditorEventCallback(view => changeWidthClass(view, 'e-width-half'))
    },
    removeBorder: {
      title: 'Poista reunat',
      onClick: useEditorEventCallback(view => addClass(view, 'e-table--borderless'))
    },
    addBorder: {
      title: 'Lisää reunat',
      onClick: useEditorEventCallback(view => removeClass(view, 'e-table--borderless'))
    },
    removeZebra: {
      title: 'Poista kuviointi',
      onClick: useEditorEventCallback(view => removeClass(view, 'e-table--zebra'))
    },
    addZebra: {
      title: 'Lisää kuviointi',
      onClick: useEditorEventCallback(view => addClass(view, 'e-table--zebra'))
    }
  }

  const [isOpen, setIsOpen] = useState(false)

  const Option = ({ title, onClick }: { title: string; onClick: () => void }) => (
    <li
      onClick={() => {
        onClick()
        setIsOpen(false)
      }}
    >
      {title}
    </li>
  )

  return (
    <>
      <span className="e-menu-dropdown">
        <button onClick={() => setIsOpen(!isOpen)}>
          <FontAwesomeIcon size="sm" icon={faTable} fixedWidth />
        </button>
        <ul className="e-menu-dropdown-menu" style={{ display: isOpen ? 'block' : 'none' }}>
          <Option {...menuOptions.addTable} />
          <Option {...menuOptions.addRowAfter} />
          <Option {...menuOptions.addColumnAfter} />
          <Option {...menuOptions.deleteRow} />
          <Option {...menuOptions.deleteColumn} />
          <Option {...menuOptions.deleteTable} />
          <Option {...menuOptions.setFullWidth} />
          <Option {...menuOptions.setHalfWidth} />
          <Option {...menuOptions.removeBorder} />
          <Option {...menuOptions.addBorder} />
          <Option {...menuOptions.removeZebra} />
          <Option {...menuOptions.addZebra} />
        </ul>
      </span>
    </>
  )
}

function changeWidthClass(view: EditorView, className: string) {
  return changeClasses(view, className, swapWidthClass)
}

function addClass(view: EditorView, className: string) {
  return changeClasses(view, className, addClassToExistingClasses)
}

function removeClass(view: EditorView, className: string) {
  return changeClasses(view, className, removeClassFromExistingClasses)
}

function addClassToExistingClasses(classes: string, newClass: string) {
  return classes ? [...classes.split(' ').filter(c => c !== newClass), newClass].join(' ') : newClass
}

function removeClassFromExistingClasses(classes: string, classToRemove: string) {
  return classes
    ? classes
        .split(' ')
        .filter(c => c !== classToRemove)
        .join(' ')
    : ''
}

function swapWidthClass(classes: string, newClass: string) {
  return classes ? [...classes.split(' ').filter(c => !c.startsWith('e-width')), newClass].join(' ') : newClass
}

function changeClasses(
  view: EditorView,
  className: string,
  convertClasses: (classes: string, classItem: string) => string
) {
  const from = view.state.selection.$from
  for (let depth = from.depth; depth > 0; depth--) {
    const node = from.node(depth)
    if (node.type.spec.tableRole == 'table') {
      if (view.dispatch) {
        view.dispatch(
          view.state.tr.setNodeMarkup(from.before(depth), null, {
            ...node.attrs,
            ...{ class: convertClasses(node.attrs.class as string, className) }
          })
        )
      }
      view.focus()
      return true
    }
  }
}
