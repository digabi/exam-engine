export const NBSP = '\u00A0'

export function parentElements(element: Element): Element[] {
  const result = []
  while (element.parentElement != null) {
    element = element.parentElement
    result.push(element)
  }
  return result
}

export function findChildElement(element: Element, predicate: (child: Element) => boolean): Element | undefined {
  for (let i = 0, length = element.children.length; i < length; i++) {
    const childElement = element.children[i]
    if (predicate(childElement)) {
      return childElement
    }
  }
}

export function findChildElementByLocalName(element: Element, localName: string): Element | undefined {
  return findChildElement(element, childElement => childElement.localName === localName)
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
