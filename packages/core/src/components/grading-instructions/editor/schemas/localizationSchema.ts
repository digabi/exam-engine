import { Node, NodeSpec } from 'prosemirror-model'

export function localizationSchema(isInputSchema: boolean, mode: 'inline' | 'block'): NodeSpec {
  return {
    [`localization_${mode}`]: {
      content: `${mode}*`,
      inline: mode === 'inline',
      group: mode,
      attrs: {
        lang: { default: null },
        examType: { default: null },
        hidden: { default: null }
      },
      parseDOM: [
        {
          tag: `[data-editor-id="e-localization-${mode}"]`,
          getAttrs(dom: HTMLElement) {
            return {
              lang: dom.getAttribute('lang') ?? null,
              examType: dom.getAttribute('exam-type') ?? null,
              hidden: isInputSchema ? (dom.getAttribute('hidden') ?? null) : null
            }
          }
        }
      ],
      toDOM(node: Node) {
        return [
          `${isInputSchema ? (mode === 'inline' ? 'span' : 'div') : 'e:localization'}`,
          {
            lang: node.attrs.lang as string,
            'exam-type': node.attrs.examType as string,
            hidden: isInputSchema ? (node.attrs.hidden as string) : null
          },
          0
        ]
      }
    }
  }
}
