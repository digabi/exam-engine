import { Element, Node } from 'libxmljs2'
import _ from 'lodash'

export function byLocalName(...names: string[]) {
  return (element: Element) => names.includes(element.name())
}

export function byAttribute(name: string, value: string) {
  return (element: Element) => element.attr(name)?.value() === value
}

export function hasAttribute(name: string) {
  return (element: Element) => element.attr(name) != null
}

export function isElement(node: Node): node is Element {
  return node instanceof Element
}

export function asElements(nodes: Node[]): Element[] {
  return nodes as Element[]
}

/**
 * Gets the value of an attribute from an XML element or returns a default
 * value. If the attribute doesn't exist and a default value isn't provided, it
 * will throw an Error.
 */
export function getAttribute<T = undefined>(
  name: string,
  element: Element,
  defaultValue?: T
): T extends undefined ? string : string | T {
  return _getAttr(element, name, String, defaultValue)
}

/**
 * Gets the value of an attribute from an XML element converted to a number or
 * returns a default value. If the attribute doesn't exist and a default value
 * isn't provided, it will throw an Error.
 */
export function getNumericAttribute<T = undefined>(
  name: string,
  element: Element,
  defaultValue?: T
): T extends undefined ? number : number | T {
  return _getAttr(element, name, Number, defaultValue)
}

/** Helper function for generating `(.//e:foo | .//e:bar | .//e:baz)`-like XPath selectors. */
export function xpathOr(names: readonly string[]) {
  return '(' + names.map(localName => `.//e:${localName}`).join(' | ') + ')'
}

function _getAttr<T, U>(
  element: Element,
  name: string,
  transform: (value: string) => U,
  defaultValue?: T
): T extends undefined ? U : T | U {
  const maybeValue = element.attr(name)?.value()
  if (maybeValue != null) {
    return transform(maybeValue) as any
  } else if (defaultValue !== undefined) {
    return defaultValue as any
  } else {
    throw new Error(`Bug: ${element.toString()} doesn't have a ${name} attribute and a default value was not supplied`)
  }
}
