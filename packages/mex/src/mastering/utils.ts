import { Element } from 'libxmljs2'

export function getAttribute(localName: string, element: Element): string | undefined {
  return element.attr(localName)?.value()
}

export function getNumericAttribute(localName: string, element: Element): number | undefined {
  const maybeNumber = getAttribute(localName, element)
  return maybeNumber != null ? Number(maybeNumber) : undefined
}

/** Helper function for generating `.//e:foo | .//e:bar | .//e:baz)`-like XPath expressions. */
export const xpathOr = (localNames: readonly string[]) =>
  '(' + localNames.map(localName => `.//e:${localName}`).join(' | ') + ')'
