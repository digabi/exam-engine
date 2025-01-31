import classNames from 'classnames'
import * as _ from 'lodash-es'
import React, { useContext } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { getAttribute, getElementPath } from '../../dom-utils'
import { AnnotationContext, AnnotationContextType } from '../context/AnnotationProvider'
import { IsInSidebarContext } from '../context/IsInSidebarContext'
import { isExistingAnnotation } from './markText'
import AnnotationTextMark from './AnnotationTextMark'
import HiddenAnnotationMark from './HiddenAnnotationMark'
import { AnnotationImageMark, useImageAnnotation } from './AnnotationImageMark'

type Props = Omit<ExamComponentProps, 'renderChildNodes'>

// eslint-disable-next-line prefer-arrow-callback
export default React.memo(function Formula({ element, className }: Props) {
  const annotationContext = useContext(AnnotationContext)
  const { isInSidebar } = useContext(IsInSidebarContext)

  if (!annotationContext.annotationsEnabled || isInSidebar !== undefined) {
    return <PlainFormula element={element} className={className} />
  }

  return <AnnotatableFormula element={element} className={className} annotationContext={annotationContext} />
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
const AnnotatableFormula = React.memo(function AnnotatableFormula(
  props: Props & { annotationContext: AnnotationContextType }
) {
  const { textAnnotations, imageAnnotations, onClickAnnotation, setNewAnnotationRef, newAnnotation, setNewAnnotation } =
    props.annotationContext
  const { svg, assistiveTitle, textContent, className } = useElementAttributes(props)
  const path = getElementPath(props.element)
  const { elementRef, annotationRect, onMouseDown } = useImageAnnotation(path, `kaava ${textContent}`, setNewAnnotation)

  const textElementAnnotations = [
    ...(textAnnotations[path] ?? []),
    ...(newAnnotation?.annotationType === 'text'
      ? (newAnnotation?.annotationParts?.filter(p => p.annotationAnchor === path) ?? [])
      : [])
  ]

  const textMarks = textElementAnnotations.map(annotation => {
    const annotationId = isExistingAnnotation(annotation) ? annotation.annotationId : null
    const key = `${annotationId ?? 0}_${annotation.annotationAnchor}`
    if (annotation.hidden) {
      return <HiddenAnnotationMark key={key} annotationId={annotationId} />
    }
    return (
      <AnnotationTextMark
        key={key}
        annotation={annotation}
        onClickAnnotation={onClickAnnotation}
        setNewAnnotationRef={setNewAnnotationRef}
        __html={svg}
      />
    )
  })

  const imageMarks = (imageAnnotations[path] ?? [])
    .map(({ annotationId, markNumber, resolved, hidden, rect }) => {
      const key = `${annotationId}_${markNumber}`
      if (hidden) {
        return <HiddenAnnotationMark key={key} annotationId={annotationId} />
      }
      return (
        <AnnotationImageMark
          key={key}
          rect={rect}
          onClickAnnotation={onClickAnnotation}
          setNewAnnotationRef={setNewAnnotationRef}
          annotationId={annotationId}
          markNumber={markNumber}
          resolved={resolved}
        />
      )
    })
    .concat(
      newAnnotation?.annotationType === 'image' && newAnnotation.annotationAnchor === path ? (
        <AnnotationImageMark
          key="new-annotation-mark"
          rect={newAnnotation.rect}
          onClickAnnotation={onClickAnnotation}
          setNewAnnotationRef={setNewAnnotationRef}
        />
      ) : (
        []
      )
    )
    .concat(
      annotationRect ? (
        <AnnotationImageMark
          key="annotation-rect"
          rect={annotationRect}
          onClickAnnotation={onClickAnnotation}
          setNewAnnotationRef={setNewAnnotationRef}
        />
      ) : (
        []
      )
    )

  return (
    <>
      <span
        ref={elementRef}
        className={className}
        aria-hidden="true"
        data-annotation-path={path}
        data-annotation-content={textContent}
        data-testid={path}
        onMouseDown={onMouseDown}
      >
        {textMarks.length > 0 ? null : <span dangerouslySetInnerHTML={{ __html: svg }} />}
        {textMarks}
        {imageMarks}
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
