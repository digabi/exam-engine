import React, { useContext, useEffect, useRef } from 'react'
import { AnnotationContext } from './components/context/AnnotationProvider'
import { onMouseDownForAnnotation } from './components/grading/examAnnotationUtils'
import { mapChildNodes, queryAncestors } from './dom-utils'
import { ExamAnnotation } from './types/Score'

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
  const annotationContextData = useContext(AnnotationContext)

  if (Object.keys(annotationContextData).length === 0) {
    return node.textContent!
  }

  const { annotations, onClickAnnotation, setNewAnnotation, setNewAnnotationRef, newAnnotation } = annotationContextData

  const newAnnotationForThisNode = newAnnotation?.annotationAnchor === key ? newAnnotation : null
  const thisNodeAnnotations = (annotations?.[key] || []).concat(newAnnotationForThisNode || [])

  const mouseUpCallback = (annotation: ExamAnnotation) => {
    const displayNumber = queryAncestors(node.parentElement!, 'question')?.getAttribute('display-number') || undefined
    setNewAnnotation({ ...annotation, annotationAnchor: key, displayNumber })
  }

  function onMouseDown(e: React.MouseEvent) {
    const target = e.target as Element
    const clickIsInPopup = target.closest('.annotation-popup')
    if (!clickIsInPopup) {
      setNewAnnotation(null)
    }
    onMouseDownForAnnotation(e, mouseUpCallback)
  }

  return (
    <span onMouseDown={onMouseDown} className="e-annotatable" key={key}>
      {thisNodeAnnotations?.length > 0 ? markText(node.textContent!, thisNodeAnnotations) : node.textContent!}
    </span>
  )

  function markText(text: string, annotations: ExamAnnotation[]): React.ReactNode[] {
    if (annotations.length === 0) {
      return [text]
    }

    annotations.sort((a, b) => a.startIndex - b.startIndex)

    const nodes: React.ReactNode[] = []
    let lastIndex = 0

    for (const annotation of annotations) {
      if (annotation.startIndex < 0 || annotation.length <= 0) {
        return [text]
      }

      // Add unmarked text before this mark
      if (annotation.startIndex > lastIndex) {
        nodes.push(text.substring(lastIndex, annotation.startIndex))
      }

      // Add marked text
      const markedText = text.substring(annotation.startIndex, annotation.startIndex + annotation.length)

      nodes.push(
        annotation.hidden ? (
          <mark
            key={annotation.startIndex}
            className="e-annotation"
            data-annotation-id={annotation.annotationId}
            data-hidden="true"
          />
        ) : (
          <Mark
            key={annotation.startIndex}
            annotation={annotation}
            markedText={markedText}
            onClickAnnotation={onClickAnnotation}
            setNewAnnotationRef={setNewAnnotationRef}
          />
        )
      )

      lastIndex = annotation.startIndex + annotation.length
    }

    // Add remaining unmarked text
    nodes.push(text.substring(lastIndex))
    return nodes
  }
}

const Mark = ({
  annotation,
  markedText,
  onClickAnnotation,
  setNewAnnotationRef
}: {
  annotation: ExamAnnotation
  markedText: string
  onClickAnnotation: (e: React.MouseEvent<HTMLElement, MouseEvent>, a: ExamAnnotation) => void
  setNewAnnotationRef: (ref: HTMLElement | undefined) => void
}) => {
  const markRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (markRef.current && !annotation.annotationId) {
      setNewAnnotationRef(markRef.current)
    }
  }, [])
  return (
    <mark
      key={annotation.startIndex}
      ref={markRef}
      className="e-annotation"
      data-annotation-id={annotation.annotationId || ''}
      data-hidden="false"
      onClick={e => onClickAnnotation(e, annotation)}
    >
      {markedText}
      {annotation?.markNumber && <sup className="e-annotation" data-content={annotation?.markNumber} />}
    </mark>
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
