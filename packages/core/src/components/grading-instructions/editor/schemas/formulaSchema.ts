import { AttributeSpec, Node, NodeSpec } from 'prosemirror-model'

export const formulaSchema: NodeSpec = {
  formula: {
    inline: true,
    group: 'inline',
    atom: true,
    attrs: {
      latex: {},
      mode: { default: '' },
      assistiveTitle: { default: '' }
    },
    parseDOM: [
      {
        tag: '[data-editor-id=e-formula]',
        getAttrs(dom: HTMLElement) {
          return {
            latex: dom.textContent,
            mode: dom.getAttribute('mode'),
            assistiveTitle: dom.getAttribute('assistive-title')
          }
        }
      }
    ],
    toDOM(node: Node) {
      const container = document.createElement('img')
      if (node.attrs.latex) {
        container.setAttribute('alt', node.attrs.latex as string)
        container.setAttribute('formula', 'true')
        container.setAttribute('src', `/math.svg?latex=${encodeURIComponent(node.attrs.latex as string)}`)
      }
      return container
    }
  }
}

export const formulaOutputSchema: NodeSpec = {
  formula: {
    ...(formulaSchema.formula as AttributeSpec),
    toDOM(node: Node) {
      if (!node.attrs.latex) {
        return ''
      }
      const formulaElement = document.createElement('e:formula')
      if (node.attrs.mode) {
        formulaElement.setAttribute('mode', node.attrs.mode as string)
      }
      if (node.attrs.assistiveTitle) {
        formulaElement.setAttribute('assistive-title', node.attrs.assistiveTitle as string)
      }
      formulaElement.textContent = node.attrs.latex as string
      const container = document.createElement('span')
      container.appendChild(formulaElement)
      return container.firstElementChild!
    }
  }
}
