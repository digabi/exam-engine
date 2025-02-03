import classNames from 'classnames'
import * as _ from 'lodash-es'
import React, { useContext } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { getAttribute, getElementPath } from '../../dom-utils'
import { AnnotationContext, AnnotationContextType } from '../context/AnnotationProvider'
import { IsInSidebarContext } from '../context/IsInSidebarContext'
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
  const { svg, assistiveTitle, isDisplayFormula } = useElementAttributes(props)
  return (
    <>
      <span
        className={classNames('e-formula', { 'e-block e-text-center': isDisplayFormula }, props.className)}
        dangerouslySetInnerHTML={{ __html: svg }}
        aria-hidden="true"
      />
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
  const { imageAnnotations, onClickAnnotation, setNewAnnotationRef, newAnnotation, setNewAnnotation } =
    props.annotationContext
  const { svg, assistiveTitle, isDisplayFormula, textContent } = useElementAttributes(props)
  const path = getElementPath(props.element)
  const { elementRef, annotationRect, onMouseDown } = useImageAnnotation(path, `kaava ${textContent}`, setNewAnnotation)

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
        className={classNames(
          'e-formula e-annotatable',
          { 'e-block e-text-center': isDisplayFormula },
          props.className
        )}
        aria-hidden="true"
        data-testid={path}
        onMouseDown={onMouseDown}
      >
        <span dangerouslySetInnerHTML={{ __html: svg }} />
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

  return { svg, assistiveTitle, isDisplayFormula, textContent }
}
