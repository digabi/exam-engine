import React, { useContext } from 'react'
import { AnnotationContext } from './components/context/AnnotationContext'
import { mapChildNodes } from './dom-utils'

export const ExamNamespaceURI = 'http://ylioppilastutkinto.fi/exam.xsd'
export const XHTMLNamespaceURI = 'http://www.w3.org/1999/xhtml'

export interface ExamComponentProps {
  className?: string
  /** An element in the exam XML. */
  element: Element
  /** A function that knows how to render the child nodes of this element. */
  renderChildNodes: RenderChildNodes
}

export const enum RenderOptions {
  RenderHTML,
  SkipHTML
}

export type RenderChildNodes = (element: Element, options?: RenderOptions) => React.ReactNode[]

function getElementPath(element: Element): string {
  let path = `${element.tagName}:${Array.from(element.parentElement?.children || []).indexOf(element)}`
  let currentElement = element

  while (currentElement.parentElement) {
    currentElement = currentElement.parentElement
    path = `${currentElement.tagName}:${Array.from(currentElement.parentElement?.children || []).indexOf(currentElement)} > ${path}`
  }

  return path
}

export function createRenderChildNodes(
  componentMap: Record<string, React.ComponentType<ExamComponentProps>>
): RenderChildNodes {
  function renderChildNode(node: ChildNode, index: number, options: RenderOptions): React.ReactNode {
    switch (node.nodeType) {
      case Node.TEXT_NODE:
      case Node.CDATA_SECTION_NODE: {
        const path = getElementPath(node.parentElement as Element)
        if (node.textContent?.trim().length) {
          console.log(path, node)
        }
        return options === RenderOptions.RenderHTML ? renderTextNode(node as Text, path) : null
      }
      case Node.ELEMENT_NODE:
        return renderElement(node as Element, index, options)
      default:
        return null
    }
  }

  function renderElement(element: Element, index: number, options: RenderOptions) {
    switch (element.namespaceURI) {
      case XHTMLNamespaceURI:
        return renderXHTMLElement(element as HTMLElement, index, options)
      case ExamNamespaceURI:
        return renderExamElement(element, index)
      default:
        throw new Error(`Unrecognized element: ${element.localName}`)
    }
  }

  function renderXHTMLElement<T extends HTMLElement>(element: T, index: number, options: RenderOptions) {
    const children = element.hasChildNodes() ? renderChildNodes(element, options) : null

    if (options === RenderOptions.RenderHTML) {
      const Tag = element.localName
      const props = htmlAttributes2props(element, index)
      return <Tag {...props}>{children}</Tag>
    } else {
      return children
    }
  }

  function renderExamElement(element: Element, index: number) {
    const Component = componentMap[element.localName]
    const className = element.getAttribute('class') || undefined
    return Component ? <Component {...{ element, className, renderChildNodes, key: key(element, index) }} /> : null
  }

  function renderChildNodes(element: Element, options: RenderOptions = RenderOptions.RenderHTML): React.ReactNode[] {
    return mapChildNodes(element, (childElement, i) => renderChildNode(childElement, i, options))
  }

  return renderChildNodes
}

function renderTextNode(node: Text, key: string) {
  const { annotations, onClickAnnotation } = useContext(AnnotationContext)
  const annotation = annotations?.[key]
  if (annotation && annotation.startIndex >= 0 && annotation.length > 0) {
    const text = node.textContent!
    const before = text.slice(0, annotation.startIndex)
    const marked = text.slice(annotation.startIndex, annotation.startIndex + annotation.length)
    const after = text.slice(annotation.startIndex + annotation.length)
    return (
      <>
        {before}
        <mark onClick={() => onClickAnnotation(annotation)}>{marked}</mark>
        {after}
      </>
    )
  }
  return node.textContent!
}

function htmlAttributes2props<T extends HTMLElement>(element: T, index: number): React.HTMLProps<T> {
  const props: React.HTMLProps<T> = { key: key(element, index) }
  for (const attribute of element.attributes) {
    const name = attribute.localName === 'class' ? 'className' : (attribute.localName as keyof React.HTMLProps<T>)
    props[name] = attribute.value
  }
  return props
}

function key(element: Element, index: number): string {
  return `${element.localName}-${index}`
}
