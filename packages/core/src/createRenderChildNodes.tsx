import React, { useContext } from 'react'
import { AnnotationContext } from './components/context/AnnotationContext'
import { mapChildNodes, queryAncestors } from './dom-utils'
import { onMouseDownForAnnotation } from './components/grading/reactAnnotation'
import { TextAnnotation } from './types/Score'
import { CreateAnnotationPopup } from './components/shared/CreateAnnotationPopup'

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
  const temp = !element.tagName && Array.from(element.parentNode?.childNodes || []).indexOf(element)
  const elementIndex = Array.from(element.parentElement?.children || []).indexOf(element)
  let path = `${element.nodeName}:${elementIndex > 0 ? elementIndex : temp}`
  let currentElement = element
  while (currentElement.parentElement) {
    currentElement = currentElement.parentElement
    const displayNumber = currentElement.getAttribute('display-number')
    const index =
      Number(displayNumber) || Array.from(currentElement.parentElement?.children || []).indexOf(currentElement)
    const elementId = currentElement.getAttribute('id')
    path = `${elementId || currentElement.nodeName}:${index} > ${path}`
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
        const path = getElementPath(node as Element)
        if (node.textContent?.trim().length) {
          //console.log(path, node.textContent.trim())
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
  const displayNumber = queryAncestors(node.parentElement!, 'question')?.getAttribute('display-number') || undefined
  const annotationData = useContext(AnnotationContext)
  if (Object.keys(annotationData).length === 0) {
    return node.textContent!
  }

  const { annotations, onClickAnnotation, onSaveAnnotation } = annotationData
  const annotationContextRef = React.createRef<HTMLDivElement>()
  const annotation = annotations?.[key]
  const [myAnnotation, setMyAnnotation] = React.useState<TextAnnotation | null>(annotation)

  const mouseUpCallback = (annotation: TextAnnotation) => {
    setMyAnnotation({
      ...annotation,
      showPopup: true,
      markNumber: displayNumber
    })
  }

  const closeEditor = () => setMyAnnotation(null)

  const hasAnnotation = myAnnotation && myAnnotation.startIndex >= 0 && myAnnotation.length > 0

  const ElementWithMark = ({ myAnnotation }: { myAnnotation: TextAnnotation }) => {
    const text = node.textContent!
    const annotationEndIndex = myAnnotation.startIndex + myAnnotation.length
    const before = text.slice(0, myAnnotation.startIndex)
    const marked = text.slice(myAnnotation.startIndex, annotationEndIndex)
    const after = text.slice(annotationEndIndex)

    function onUpdateComment(comment: string) {
      onSaveAnnotation({ ...myAnnotation, message: comment }, key)
      closeEditor()
    }

    return (
      <>
        {before}
        <span style={{ position: 'relative' }} key={key}>
          <mark
            onClick={e => {
              onClickAnnotation(e, myAnnotation)
            }}
          >
            {marked}
          </mark>
          <sup data-content={annotation.markNumber} />
          {myAnnotation.showPopup && (
            <CreateAnnotationPopup updateComment={onUpdateComment} closeEditor={closeEditor} />
          )}
        </span>
        {after}
      </>
    )
  }

  return (
    <span
      onMouseDown={e => onMouseDownForAnnotation(e, mouseUpCallback)}
      ref={annotationContextRef}
      key={key}
      className="e-annotatable"
    >
      {hasAnnotation ? <ElementWithMark myAnnotation={myAnnotation} /> : node.textContent!}
    </span>
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
