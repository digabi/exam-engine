import React, { useEffect, useRef, useState } from 'react'
import { Annotation, TextAnnotation } from '../..'
import * as _ from 'lodash-es'
import AnnotationList from '../results/internal/AnnotationList'
import { AnswerWithAnnotations } from './AnswerWithAnnotations'
import {
  calculatePosition,
  getPopupCss,
  hasTextSelectedInAnswerText,
  mergeAnnotation,
  selectionHasNothingToUnderline,
} from './editAnnotations'
import { AnnotationPopup } from './AnnotationPopup'

export const GradingAnswer: React.FunctionComponent<{
  type: 'richText' | 'text'
  value?: string
  annotations: { pregrading: Annotation[]; censoring: Annotation[] }
  setAnnotations: (annotations: { pregrading: Annotation[]; censoring: Annotation[] }) => void
}> = ({ type, annotations, setAnnotations, value }) => {
  const answerRef = useRef<HTMLDivElement>(null)
  const [popupVisible, setPopupVisible] = useState<boolean>(false)
  const [position, setPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 })

  const [currentAnnotations, setCurrentAnnotations] = useState<{ pregrading: Annotation[]; censoring: Annotation[] }>(
    annotations
  )

  useEffect(() => {
    if (answerRef.current) {
      document.addEventListener('selectionchange', onSelect)
      document.addEventListener('mousedown', () => console.log('mousedown'))
      document.addEventListener('mouseup', onMouseUp)
      return () => {}
    }
  }, [])
  const newAnnotation = useRef<TextAnnotation>()

  useEffect(() => {
    setCurrentAnnotations(annotations)
    console.log(annotations, '\n=== annotations')
  }, [annotations])
  function onSelect() {}

  function onMouseUp() {
    const selection = window.getSelection()
    if (selection && answerRef.current !== null && hasTextSelectedInAnswerText()) {
      const range = selection.getRangeAt(0)
      if (selectionHasNothingToUnderline(range)) {
        return
      }
      const position = calculatePosition(answerRef.current, range)
      const annotation: Annotation = { ...position, type: 'text', message: '' }
      newAnnotation.current = annotation
      const popupCss = getPopupCss(range, answerRef.current)
      setPosition(popupCss)

      setCurrentAnnotations((currentAnnotations) => ({
        pregrading: annotations.pregrading,
        censoring: mergeAnnotation(answerRef.current!, annotation, currentAnnotations.censoring),
      }))
      setPopupVisible(true)
    }
  }

  function setMessage(message: string) {
    setAnnotations({
      pregrading: annotations.pregrading,
      censoring: mergeAnnotation(
        answerRef.current!,
        {
          ...newAnnotation.current!,
          message,
        },
        annotations.censoring || []
      ),
    })
    setPopupVisible(false)
  }
  return (
    <div
      style={{ position: 'relative' }}
      className="e-multiline-results-text-answer e-line-height-l e-pad-l-2 e-mrg-b-1"
    >
      <div ref={answerRef}>
        <AnswerWithAnnotations type={type} value={value} annotations={currentAnnotations} />
      </div>
      <AnnotationPopup
        position={position}
        setMessage={setMessage}
        message={newAnnotation.current?.message || ''}
        popupVisible={popupVisible}
      />

      <AnnotationList />
    </div>
  )
}
