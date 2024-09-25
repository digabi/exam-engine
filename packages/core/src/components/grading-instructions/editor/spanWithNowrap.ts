import { Node, MarkSpec } from 'prosemirror-model'

export const spanWithNowrap: MarkSpec = {
  spanWithClass: {
    attrs: {
      class: { default: null }
    },
    parseDOM: [
      {
        tag: 'span[class="e-nowrap"]',
        getAttrs(dom: HTMLElement) {
          return { class: dom.getAttribute('class') || null }
        }
      }
    ],
    toDOM(node: Node) {
      return ['span', { class: node.attrs.class as string }, 0]
    }
  }
}
