import { MarkSpec, Node } from 'prosemirror-model'

export const spanWithLangSchema: MarkSpec = {
  spanWithLang: {
    attrs: {
      lang: { default: null }
    },
    parseDOM: [
      {
        tag: 'span[lang]',
        getAttrs(dom: HTMLElement) {
          return { lang: dom.getAttribute('lang') || null }
        }
      }
    ],
    toDOM(node: Node) {
      return ['span', { lang: node.attrs.lang as string }, 0]
    }
  }
}
