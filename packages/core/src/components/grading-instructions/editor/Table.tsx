import {
  addColumnAfter,
  addRowAfter,
  deleteColumn,
  deleteRow,
  deleteTable,
  goToNextCell,
  tableNodes
} from 'prosemirror-tables'
import { Fragment, Node, NodeSpec, ResolvedPos } from 'prosemirror-model'
import React, { useEffect, useState } from 'react'
import { useEditorEventCallback, useEditorState } from '@nytimes/react-prosemirror'
import { EditorState, TextSelection, Transaction } from 'prosemirror-state'
import { faTable, faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { EditorView } from 'prosemirror-view'
import classNames from 'classnames'
import { keymap } from 'prosemirror-keymap'

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

export function tablePlugin() {
  return keymap({
    Tab: goToNextCell(1),
    'Shift-Tab': goToNextCell(-1)
  })
}

export function TableMenu(props: { dropdownsBelow: boolean }) {
  const [isActive, setIsActive] = useState(false)
  const [isOpen, setIsOpen] = useState({ add: false, remove: false, styles: false })
  const [classes, setClasses] = useState<string[]>([])
  const editorState = useEditorState()

  const getTableFromPosition = (pos: ResolvedPos) => {
    for (let d = pos.depth; d > 0; d--) {
      const node = pos.node(d)
      if (node.type.name === 'table') {
        return node
      }
    }
    return null
  }

  useEffect(() => {
    const table = getTableFromPosition(editorState.selection.$from)
    setIsActive(!!table)
    if (table) {
      setIsOpen({ add: false, remove: false, styles: false })
      setClasses(table.attrs.class ? (table.attrs.class as string).split(' ') : [])
    } else {
      setClasses([])
    }
  }, [editorState])

  const withFocus = (
    view: EditorView,
    action: (state: EditorState, dispatch?: (tr: Transaction) => void) => boolean
  ) => {
    const result = action(view.state, view.dispatch)
    view.focus()
    return result
  }

  const menuOptions: {
    [key: string]: {
      title: string
      onClick: () => boolean | undefined
      className?: string
      shouldShowOption?: () => boolean
    }
  } = {
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
      className: 'e-width-full',
      shouldShowOption: () => !classes.includes(menuOptions.setFullWidth.className!),
      onClick: useEditorEventCallback(view => changeWidthClass(view, menuOptions.setFullWidth.className!))
    },
    setHalfWidth: {
      title: 'Puolikas leveys',
      className: 'e-width-half',
      shouldShowOption: () => !classes.includes(menuOptions.setHalfWidth.className!),
      onClick: useEditorEventCallback(view => changeWidthClass(view, menuOptions.setHalfWidth.className!))
    },
    removeBorder: {
      title: 'Poista reunat',
      className: 'e-table--borderless',
      shouldShowOption: () => !classes.includes(menuOptions.removeBorder.className!),
      onClick: useEditorEventCallback(view => addClass(view, menuOptions.removeBorder.className!))
    },
    addBorder: {
      title: 'Lisää reunat',
      className: 'e-table--borderless',
      shouldShowOption: () => classes.includes(menuOptions.addBorder.className!),
      onClick: useEditorEventCallback(view => removeClass(view, menuOptions.addBorder.className!))
    },
    removeZebra: {
      title: 'Poista raidat',
      className: 'e-table--zebra',
      shouldShowOption: () => classes.includes(menuOptions.removeZebra.className!),
      onClick: useEditorEventCallback(view => removeClass(view, menuOptions.removeZebra.className!))
    },
    addZebra: {
      title: 'Lisää raidat',
      className: 'e-table--zebra',
      shouldShowOption: () => !classes.includes(menuOptions.addZebra.className!),
      onClick: useEditorEventCallback(view => addClass(view, menuOptions.addZebra.className!))
    }
  }

  const Option = ({ title, onClick }: { title: string; onClick: () => void }) => (
    <li
      onClick={() => {
        onClick()
        setIsOpen({ add: false, remove: false, styles: false })
      }}
    >
      {title}
    </li>
  )

  return (
    <>
      <button
        onClick={() => menuOptions.addTable.onClick()}
        className={classNames({ active: isActive })}
        data-testid="editor-menu-add-table"
      >
        <FontAwesomeIcon size="lg" icon={faTable} className="editor-menu-icon" fixedWidth />
      </button>

      {isActive && (
        <>
          <DropdownMenu
            title="Tyylit"
            openState={isOpen.styles}
            setOpen={state => setIsOpen({ add: false, remove: false, styles: state })}
            dropdownsBelow={props.dropdownsBelow}
          >
            {menuOptions.setFullWidth.shouldShowOption!() && <Option {...menuOptions.setFullWidth} />}
            {menuOptions.setHalfWidth.shouldShowOption!() && <Option {...menuOptions.setHalfWidth} />}
            {menuOptions.addBorder.shouldShowOption!() && <Option {...menuOptions.addBorder} />}
            {menuOptions.removeBorder.shouldShowOption!() && <Option {...menuOptions.removeBorder} />}
            {menuOptions.addZebra.shouldShowOption!() && <Option {...menuOptions.addZebra} />}
            {menuOptions.removeZebra.shouldShowOption!() && <Option {...menuOptions.removeZebra} />}
          </DropdownMenu>
          <DropdownMenu
            title="Lisää"
            openState={isOpen.add}
            setOpen={state => setIsOpen({ add: state, remove: false, styles: false })}
            dropdownsBelow={props.dropdownsBelow}
          >
            <Option {...menuOptions.addRowAfter} />
            <Option {...menuOptions.addColumnAfter} />
          </DropdownMenu>

          <DropdownMenu
            title="Poista"
            openState={isOpen.remove}
            setOpen={state => setIsOpen({ add: false, remove: state, styles: false })}
            dropdownsBelow={props.dropdownsBelow}
          >
            <Option {...menuOptions.deleteRow} />
            <Option {...menuOptions.deleteColumn} />
            <Option {...menuOptions.deleteTable} />
          </DropdownMenu>
        </>
      )}
    </>
  )
}

function DropdownMenu({
  title,
  openState,
  setOpen,
  dropdownsBelow,
  children
}: {
  title: string
  openState: boolean
  setOpen: (state: boolean) => void
  dropdownsBelow: boolean
  children: React.ReactNode
}) {
  const menuClosedIcon = dropdownsBelow ? faAngleDown : faAngleUp
  const menuOpenIcon = dropdownsBelow ? faAngleUp : faAngleDown

  return (
    <>
      <button onClick={() => setOpen(!openState)}>
        {title}
        <FontAwesomeIcon
          size="lg"
          className="editor-menu-icon-open-close"
          icon={openState ? menuClosedIcon : menuOpenIcon}
          fixedWidth
        />
      </button>
      <span className="e-menu-dropdown">
        <ul
          style={{ display: openState ? 'block' : 'none' }}
          className={classNames({ 'e-menu-dropdown-menu': true, ['dropdowns-below']: dropdownsBelow })}
        >
          {children}
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
