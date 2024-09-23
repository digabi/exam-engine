import * as _ from 'lodash-es'
import { NodeSpec } from 'prosemirror-model'
import { schema as baseSchema } from 'prosemirror-schema-basic'

const existingImageNode = baseSchema.spec.nodes.get('image')

export const imageInputSchema = (resolveAttachment: (filename: string) => string): NodeSpec => ({
  ...existingImageNode,
  attrs: {
    ...existingImageNode?.attrs,
    width: { default: null },
    height: { default: null },
    class: { default: null },
    lang: { default: null }
  },
  parseDOM: [
    {
      tag: '[data-editor-id="e-image"], img',
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
    return ['e:image', attributes]
  }
}
