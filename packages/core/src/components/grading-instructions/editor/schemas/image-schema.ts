import { NodeSpec } from 'prosemirror-model'
import { schema as baseSchema } from 'prosemirror-schema-basic'

const existingImageNode = baseSchema.spec.nodes.get('image')

export const extendedImageNode = (resolveAttachment: (filename: string) => string): NodeSpec => ({
  ...existingImageNode,
  attrs: {
    ...existingImageNode?.attrs,
    width: { default: null },
    height: { default: null },
    class: { default: null },
    lang: { default: null },
    'data-editor-id': { default: null }
  },
  parseDOM: [
    {
      tag: '[data-editor-id="e-image"]',
      getAttrs(element) {
        const attrs = {
          ...Object.fromEntries(Array.from(element.attributes).map(attr => [attr.name, attr.value])),
          src: resolveAttachment(element.getAttribute('src') || '')
        }
        return attrs
      }
    }
  ],
  toDOM(node) {
    return ['img', node.attrs]
  }
})
