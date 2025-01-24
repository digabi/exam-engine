import classNames from 'classnames'
import * as _ from 'lodash-es'
import React, { useCallback, useContext, useRef } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { getAttribute, getElementPath } from '../../dom-utils'
import { AnnotationContext } from '../context/AnnotationProvider'
import { IsInSidebarContext } from '../context/IsInSidebarContext'
import { isExistingAnnotation } from './markText'
import AnnotationMark from './AnnotationMark'
import HiddenAnnotationMark from './HiddenAnnotationMark'

type Props = Omit<ExamComponentProps, 'renderChildNodes'>

// eslint-disable-next-line prefer-arrow-callback
export default React.memo(function Formula({ element, className }: Props) {
  const { annotations } = useContext(AnnotationContext)
  const { isInSidebar } = useContext(IsInSidebarContext)

  if (annotations === undefined || isInSidebar !== undefined) {
    return <PlainFormula element={element} className={className} />
  }

  return <AnnotatableFormula element={element} className={className} />
})

// eslint-disable-next-line prefer-arrow-callback
const PlainFormula = React.memo(function PlainFormula(props: Props) {
  const { svg, assistiveTitle, className } = useElementAttributes(props)
  return (
    <>
      <span className={className} dangerouslySetInnerHTML={{ __html: svg }} aria-hidden="true" />
      <AssistiveTitle assistiveTitle={assistiveTitle} />
    </>
  )
})

// eslint-disable-next-line prefer-arrow-callback
const AssistiveTitle = React.memo(function AssistiveTitle({ assistiveTitle }: { assistiveTitle: string }) {
  return <span className="e-screen-reader-only">{assistiveTitle}</span>
})

// eslint-disable-next-line prefer-arrow-callback
const AnnotatableFormula = React.memo(function AnnotatableFormula(props: Props) {
  const { annotations, onClickAnnotation, setNewAnnotationRef, newAnnotation, setNewAnnotation } =
    useContext(AnnotationContext)
  const spanRef = useRef<HTMLElement>(null)
  const { svg, assistiveTitle, textContent, className } = useElementAttributes(props)

  if (annotations === undefined || !onClickAnnotation) {
    return null
  }

  const path = getElementPath(props.element)
  const onClick = useCallback(() => {
    const displayNumber = spanRef.current
      ?.closest('div[data-annotation-anchor]')
      ?.getAttribute('data-annotation-anchor')

    if (!displayNumber || !textContent) {
      return
    }

    setNewAnnotation({
      annotationParts: [{ annotationAnchor: path, selectedText: textContent, startIndex: 0, length: 0 }],
      displayNumber,
      selectedText: textContent,
      hidden: false
    })
  }, [path])

  const elementAnnotations = [
    ...(annotations[path] ?? []),
    ...(newAnnotation?.annotationParts?.filter(p => p.annotationAnchor === path) ?? [])
  ]

  const marks = elementAnnotations.map(annotation => {
    const annotationId = isExistingAnnotation(annotation) ? annotation.annotationId : null
    const key = `${annotationId ?? 0}_${annotation.startIndex}`
    if (annotation.hidden) {
      return <HiddenAnnotationMark key={key} annotationId={annotationId} />
    }
    return (
      <AnnotationMark
        key={key}
        annotation={annotation}
        onClickAnnotation={onClickAnnotation}
        setNewAnnotationRef={setNewAnnotationRef}
        __html={svg}
      />
    )
  })

  return (
    <>
      <span
        ref={spanRef}
        className={className}
        aria-hidden="true"
        data-annotation-path={path}
        data-annotation-content={textContent}
        data-testid={path}
        onClick={onClick}
        {...(marks.length > 0 ? {} : { dangerouslySetInnerHTML: { __html: svg } })}
      >
        {marks.length > 0 ? marks : null}
      </span>
      <AssistiveTitle assistiveTitle={assistiveTitle} />
    </>
  )
})

function useElementAttributes(props: Props) {
  const svg = getAttribute(props.element, 'svg')!
  const textContent = props.element.textContent?.trim()
  const assistiveTitle = (getAttribute(props.element, 'assistive-title') || textContent) ?? ''
  const isDisplayFormula = getAttribute(props.element, 'mode') === 'display'
  const className = classNames(
    'e-formula e-annotatable',
    { 'e-block e-text-center': isDisplayFormula },
    props.className
  )

  return { svg, assistiveTitle, textContent, className }
}
