import React, { useContext } from 'react'
import { AnnotationContext } from './components/context/AnnotationProvider'
import { IsInSidebarContext } from './components/context/IsInSidebarContext'
import { getElementPath, mapChildNodes } from './dom-utils'
import { AnnotatableText } from './components/shared/AnnotatableText'

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

export function createRenderChildNodes(
  componentMap: Record<string, React.ComponentType<ExamComponentProps>>
): RenderChildNodes {
  function renderChildNode(node: ChildNode, index: number, options: RenderOptions): React.ReactNode {
    switch (node.nodeType) {
      case Node.TEXT_NODE:
      case Node.CDATA_SECTION_NODE: {
        return options === RenderOptions.RenderHTML ? renderTextNode(node) : null
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

function renderTextNode(node: Node) {
  const annotationContextData = useContext(AnnotationContext)
  const { isInSidebar } = useContext(IsInSidebarContext)

  if (
    annotationContextData?.annotations === undefined ||
    node.textContent?.trim().length === 0 ||
    isInSidebar !== undefined
  ) {
    return node.textContent!
  }

  return (
    <AnnotatableText node={node} annotationContextData={annotationContextData} key={getElementPath(node as Element)} />
  )
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
