import { ExamNamespaceURI } from './createRenderChildNodes'
export const NBSP = '\u00A0'

export function parentElements(element: Element, selector?: Selector): Element[] {
  const predicate = selector != null ? mkPredicate(selector) : undefined
  const result = []
  while (element.parentElement != null) {
    element = element.parentElement
    if (predicate == null || predicate(element)) {
      result.push(element)
    }
  }
  return result
}

type Selector = string | string[] | ((element: Element) => boolean)

function mkPredicate(selector: Selector): (element: Element) => boolean {
  return typeof selector === 'function'
    ? (element: Element) => element.namespaceURI === ExamNamespaceURI && selector(element)
    : Array.isArray(selector)
    ? (element: Element) => element.namespaceURI === ExamNamespaceURI && selector.includes(element.localName)
    : (element: Element) => element.namespaceURI === ExamNamespaceURI && element.localName === selector
}

export function query(root: Element, selector: Selector): Element | undefined {
  const predicate = mkPredicate(selector)

  function go(element: Element): Element | undefined {
    for (let i = 0, length = element.children.length; i < length; i++) {
      const childElement = element.children[i]
      if (predicate(childElement)) {
        return childElement
      }
      const maybeElement = go(childElement)
      if (maybeElement != null) {
        return maybeElement
      }
    }
  }

  return go(root)
}

export function queryAll(root: Element, selector: Selector, recurse: boolean = true): Element[] {
  const predicate = mkPredicate(selector)
  const results: Element[] = []

  function go(element: Element) {
    for (let i = 0, length = element.children.length; i < length; i++) {
      const childElement = element.children[i]
      if (predicate(childElement)) {
        results.push(childElement)
        if (recurse) {
          go(childElement)
        }
      } else {
        go(childElement)
      }
    }
  }

  go(root)
  return results
}

export function queryAncestors(element: Element, selector: Selector): Element | undefined {
  const predicate = mkPredicate(selector)
  while (element.parentElement != null) {
    element = element.parentElement
    if (predicate(element)) {
      return element
    }
  }
}

export function findChildElement(element: Element, selector: Selector): Element | undefined {
  const predicate = mkPredicate(selector)

  for (let i = 0, length = element.children.length; i < length; i++) {
    const childElement = element.children[i]
    if (predicate(childElement)) {
      return childElement
    }
  }
}

export function getNumericAttribute(element: Element, attributeName: string): number | undefined {
  const maybeValue = element.getAttribute(attributeName)
  return maybeValue != null ? Number(maybeValue) : undefined
}

export function mapChildNodes<T>(element: Element, fn: (childNode: ChildNode, index: number) => T): T[] {
  const length = element.childNodes.length
  const result = new Array(length)
  for (let i = 0; i < length; i++) {
    result[i] = fn(element.childNodes[i], i)
  }
  return result
}

export function mapChildElements<T>(element: Element, fn: (childElement: Element, index: number) => T): T[] {
  const result = []
  for (let i = 0, length = element.children.length; i < length; i++) {
    const childElement = element.children[i]
    result.push(fn(childElement, i))
  }
  return result
}

export function findChildrenAnswers(element: Element) {
  return queryAll(element, ['choice-answer', 'dropdown-answer', 'text-answer', 'scored-text-answer'], true)
}
