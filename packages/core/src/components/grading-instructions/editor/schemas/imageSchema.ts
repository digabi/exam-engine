import * as _ from 'lodash-es'
import { NodeSpec } from 'prosemirror-model'
import { schema as baseSchema } from 'prosemirror-schema-basic'

const existingImageNode = baseSchema.spec.nodes.get('image')

export const imageInputSchema = (resolveAttachment: (filename: string) => string): NodeSpec => ({
  ...existingImageNode,
  content: 'inline*',
  marks: '_',
  attrs: {
    ...existingImageNode?.attrs,
    width: { default: null },
    height: { default: null },
    class: { default: null },
    lang: { default: null },
    hasTitle: { default: false }
  },
  parseDOM: [
    {
      tag: '[data-editor-id="e-image"], img',
      getAttrs(element) {
        const src = element.getAttribute('src')

        if (!src || src.startsWith('data:')) {
          return false
        }
        const attrs = {
          ...Object.fromEntries(Array.from(element.attributes).map(attr => [attr.name, attr.value])),
          src: resolveAttachment(element.getAttribute('src') || ''),
          hasTitle: !!element.querySelector('[data-editor-id="e-image-title"]')
        }
        return attrs
      }
    }
  ],
  toDOM(node) {
    if (node.attrs.hasTitle) {
      return ['figure', {}, ['img', node.attrs], ['figcaption', {}, 0]]
    } else {
      return ['img', node.attrs]
    }
  }
})

const pathToFilename = (path: string) => path.split('/').pop()

export const imageOutputSchema: NodeSpec = {
  toDOM(node) {
    const attrs = _.pick(node.attrs, ['lang', 'class', 'src'])
    const filteredAttrs = _.pickBy(attrs, _.isString)
    const attributes = _.mapValues(filteredAttrs, (value, key) => {
      if (key === 'src') {
        return pathToFilename(value)
      }
      return value
    })
    if (node.attrs.hasTitle) {
      return ['e:image', attributes, ['e:image-title', {}, 0]]
    } else {
      return ['e:image', attributes]
    }
  }
}
