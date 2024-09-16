import { DOMSerializer, Fragment, Schema } from 'prosemirror-model'

export const serializeFragment = (schema: Schema, fragment: Fragment) => {
  const serializedFragment = DOMSerializer.fromSchema(schema).serializeFragment(fragment, {
    document: document
  })

  const transformNode = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement

      if (element.nodeName === 'IMG' && element.classList.contains('e-image')) {
        const eImage = document.createElement('e:image')
        eImage.innerHTML = element.innerHTML

        const src = element.getAttribute('src') || ''
        const filename = src.split('/').pop() || ''

        Array.from(element.attributes).forEach(attr => {
          eImage.setAttribute(attr.name, attr.name === 'src' ? filename : attr.value)
        })

        element.replaceWith(eImage)
      }
    }

    node.childNodes.forEach(transformNode)
  }

  serializedFragment.childNodes.forEach(transformNode)

  return serializedFragment
}
