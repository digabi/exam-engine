import { NodeSpec } from 'prosemirror-model'
import { schema as baseSchema } from 'prosemirror-schema-basic'

const existingImageNode = baseSchema.spec.nodes.get('image')

export const extendedImageNode = (resolveAttachment: (filename: string) => string): NodeSpec => ({
  ...existingImageNode,
  attrs: {
    ...existingImageNode?.attrs,
    class: { default: 'e-image' }
  },
  parseDOM: [
    {
      tag: '[src]',
      getAttrs(element) {
        if (element.nodeName.toLowerCase() === 'e:image') {
          return {
            ...Object.fromEntries(Array.from(element.attributes).map(attr => [attr.name, attr.value])),
            src: resolveAttachment(element.getAttribute('src') || ''),
            class: `${element.getAttribute('class')} e-image`
          }
        }
        return false
      }
    }
  ],
  toDOM(node) {
    return ['img', node.attrs]
  }
})
