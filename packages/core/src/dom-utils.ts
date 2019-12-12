export const NBSP = '\u00A0'

export function parentElements(element: Element, selector?: Selector): Element[] {
  const predicate = selector != null ? mkPredicate(element, selector) : undefined
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

function mkPredicate(root: Element, selector: Selector): (element: Element) => boolean {
  return typeof selector === 'function'
    ? (element: Element) => selector(element) && element !== root
    : Array.isArray(selector)
    ? (element: Element) => selector.includes(element.localName) && element !== root
    : (element: Element) => element.localName === selector && element !== root
}

export function query(root: Element, selector: Selector): Element | undefined {
  const predicate = mkPredicate(root, selector)

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
  const predicate = mkPredicate(root, selector)
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

export function closest(element: Element, selector: Selector): Element | undefined {
  const predicate = mkPredicate(element, selector)
  while (element.parentElement != null) {
    element = element.parentElement
    if (predicate(element)) {
      return element
    }
  }
}

export function findChildElement(element: Element, selector: Selector): Element | undefined {
  const predicate = mkPredicate(element, selector)

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
