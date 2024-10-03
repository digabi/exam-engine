import { tableNodes } from 'prosemirror-tables'
import { Node, NodeSpec } from 'prosemirror-model'

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
