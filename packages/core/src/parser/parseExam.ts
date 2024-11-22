import * as _ from 'lodash-es'
import { findChildElement, getAttribute, queryAll } from '../dom-utils'

export default function parseExam(examXml: string, deterministicRendering = false): XMLDocument {
  const doc = new DOMParser().parseFromString(examXml, 'application/xml')
  if (!deterministicRendering) {
    queryAll(doc.documentElement, ['choice-answer', 'dropdown-answer'], true)
      .filter(e => getAttribute(e, 'ordering') !== 'fixed')
      .forEach(randomizeOptions)
  }

  // The reference parts (e.g. author, title and so on) are displayed as inline
  // elements. We also want to add separators between them. To avoid
  // whitespace between an reference part and the separator, (e.g. `<span> foo
  // </span>separator<span> bar </span>` is rendered as `foo separator bar` on
  // the screen) trim the excess whitespace from the reference parts here.
  queryAll(doc.documentElement, 'reference').forEach(reference => {
    queryAll(reference, () => true, false).forEach(trimWhitespace)
  })

  return doc
}

function randomizeOptions(elem: Element) {
  for (let i = elem.children.length; i > 0; i--) {
    const j = Math.floor(Math.random() * i)
    elem.appendChild(elem.children[j])
  }

  // A no-answer option should always be the last
  const noAnswerOption = findChildElement(elem, option => getAttribute(option, 'type') === 'no-answer')
  if (noAnswerOption) elem.appendChild(noAnswerOption)
}

function trimWhitespace(element: Element) {
  const nonWhitespaceNode = (node: Text) => /\S/.test(node.textContent!)
  const getTextNodes = () => {
    const result = []
    const treeWalker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
    while (treeWalker.nextNode()) {
      result.push(treeWalker.currentNode as Text)
    }
    return result
  }

  const textNodes = getTextNodes()
  const firstNonWhitespaceTextNode = _.findIndex(textNodes, nonWhitespaceNode)
  const lastNonWhitespaceTextNode = _.findLastIndex(textNodes, nonWhitespaceNode)

  // Remove leading whitespace from the start
  if (firstNonWhitespaceTextNode !== -1) {
    textNodes.slice(0, firstNonWhitespaceTextNode).forEach(node => node.remove())
    textNodes[firstNonWhitespaceTextNode].textContent = _.trimStart(textNodes[firstNonWhitespaceTextNode].textContent!)
  }
  // ...and trailing whitespace from the end.
  if (lastNonWhitespaceTextNode !== -1) {
    textNodes.slice(lastNonWhitespaceTextNode + 1).forEach(node => node.remove())
    textNodes[lastNonWhitespaceTextNode].textContent = _.trimEnd(textNodes[lastNonWhitespaceTextNode].textContent!)
  }
}
