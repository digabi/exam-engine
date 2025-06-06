import React from 'react'
import { getElementPath, mapChildNodes } from './dom-utils'

export const ExamNamespaceURI = 'http://ylioppilastutkinto.fi/exam.xsd'
export const XHTMLNamespaceURI = 'http://www.w3.org/1999/xhtml'

export interface ExamComponentProps {
  className?: string
  /** An element in the exam XML. */
  element: Element
  /** A function that knows how to render the child nodes of this element. */
  renderChildNodes: RenderChildNodes
  /** A map of component overrides for rendering nodes  */
  renderComponentOverrides: RenderComponentOverrides
  /** Option to inform whether element should be rendered **/
  options?: RenderOptions
}

export const enum RenderOptions {
  RenderHTML,
  SkipHTML
}

export type RenderChildNodes = (element: Element, options?: RenderOptions) => React.ReactNode[]
export type RenderComponentOverrides = Record<string, React.ComponentType<ExamComponentProps>>
type ComponentDefinition =
  | React.ComponentType<ExamComponentProps>
  | {
      component: React.ComponentType<ExamComponentProps>
      wrapper: React.ComponentType<React.PropsWithChildren<{ element: Element }>>
    }

export function createRenderChildNodes(componentMap: Record<string, ComponentDefinition>) {
  return (renderComponentOverrides: Record<string, React.ComponentType<ExamComponentProps>> = {}): RenderChildNodes => {
    function renderChildNode(node: ChildNode, index: number, options: RenderOptions): React.ReactNode {
      switch (node.nodeType) {
        case Node.TEXT_NODE:
        case Node.CDATA_SECTION_NODE: {
          return options === RenderOptions.RenderHTML ? renderTextNode(node as Element) : null
        }
        case Node.ELEMENT_NODE:
          return renderElement(node as Element, index, options)
        default:
          return null
      }
    }

    function renderTextNode(element: Element) {
      const Component = renderComponentOverrides['text']
      return Component ? (
        <Component
          key={getElementPath(element)}
          element={element}
          renderChildNodes={renderChildNodes}
          renderComponentOverrides={renderComponentOverrides}
        />
      ) : (
        element.textContent
      )
    }

    function renderElement(element: Element, index: number, options: RenderOptions) {
      switch (element.namespaceURI) {
        case XHTMLNamespaceURI:
          return renderXHTMLElement(element as HTMLElement, index, options)
        case ExamNamespaceURI:
          return renderExamElement(element, index, options)
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

    function renderExamElement(element: Element, index: number, options: RenderOptions) {
      if (!(element.localName in componentMap)) {
        return null
      }

      const elementComponentDefinition = componentMap[element.localName]

      const Wrapper = 'wrapper' in elementComponentDefinition ? elementComponentDefinition.wrapper : undefined
      const Component =
        renderComponentOverrides[element.localName] ??
        ('component' in elementComponentDefinition ? elementComponentDefinition.component : elementComponentDefinition)

      const className = element.getAttribute('class') || undefined
      const content = (
        <Component
          {...{
            element,
            className,
            renderChildNodes,
            renderComponentOverrides,
            key: Wrapper ? undefined : key(element, index),
            options
          }}
        />
      )
      return Wrapper ? (
        <Wrapper key={key(element, index)} element={element}>
          {content}
        </Wrapper>
      ) : (
        content
      )
    }

    function renderChildNodes(element: Element, options: RenderOptions = RenderOptions.RenderHTML): React.ReactNode[] {
      return mapChildNodes(element, (childElement, i) => renderChildNode(childElement, i, options))
    }

    return renderChildNodes
  }
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
