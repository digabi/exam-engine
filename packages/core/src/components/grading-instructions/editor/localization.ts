import { Node, MarkSpec } from 'prosemirror-model'

export function localization(hideable: boolean): MarkSpec {
  return {
    localization: {
      attrs: {
        lang: { default: null },
        examType: { default: null },
        hidden: { default: null }
      },
      parseDOM: [
        {
          tag: '[e-localization]',
          getAttrs(dom: HTMLElement) {
            return {
              lang: dom.getAttribute('lang') ?? null,
              examType: dom.getAttribute('exam-type') ?? null,
              hidden: hideable ? (dom.getAttribute('hidden') ?? null) : null
            }
          }
        }
      ],
      toDOM(node: Node) {
        return [
          'e:localization',
          {
            lang: node.attrs.lang as string,
            'exam-type': node.attrs.examType as string,
            hidden: hideable ? (node.attrs.hidden as string) : null
          },
          0
        ]
      }
    }
  }
}
