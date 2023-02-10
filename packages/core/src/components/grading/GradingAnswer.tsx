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
  savedAnnotations: { pregrading: Annotation[]; censoring: Annotation[] }
  saveAnnotations: (annotations: { pregrading: Annotation[]; censoring: Annotation[] }) => void
}> = ({ type, savedAnnotations, saveAnnotations, value }) => {
  const answerRef = useRef<HTMLDivElement>(null)
  const [popupVisible, setPopupVisible] = useState<boolean>(false)
  const [position, setPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 })

  const [unsavedAnnotations, setUnsavedAnnotations] = useState<{
    pregrading: Annotation[]
    censoring: Annotation[]
  }>()

  // useEffect(() => {
  //   setCurrentAnnotations(annotations)
  // }, [annotations])

  console.log(savedAnnotations, unsavedAnnotations, '\n=== annotations, currentAnnotations')
  useEffect(() => {
    if (answerRef.current) {
      document.addEventListener('selectionchange', onSelect)
      document.addEventListener('mousedown', () => console.log('mousedown'))
      document.addEventListener('mouseup', onMouseUp)
      return () => {}
    }
  }, [])
  const newAnnotation = useRef<TextAnnotation>()

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

      setUnsavedAnnotations({
        pregrading: savedAnnotations.pregrading,
        censoring: mergeAnnotation(answerRef.current, annotation, savedAnnotations.censoring),
      })
      setPopupVisible(true)
    }
  }

  function confirmAnnotation(message: string) {
    saveAnnotations({
      pregrading: savedAnnotations.pregrading,
      censoring: mergeAnnotation(
        answerRef.current!,
        {
          ...newAnnotation.current!,
          message,
        },
        savedAnnotations.censoring || []
      ),
    })
    setUnsavedAnnotations(undefined)
    setPopupVisible(false)
    newAnnotation.current = undefined
  }
  return (
    <div
      style={{ position: 'relative' }}
      className="e-multiline-results-text-answer e-line-height-l e-pad-l-2 e-mrg-b-1"
    >
      <div ref={answerRef}>
        <AnswerWithAnnotations type={type} value={value} annotations={unsavedAnnotations || savedAnnotations} />
      </div>
      <AnnotationPopup
        position={position}
        setMessage={confirmAnnotation}
        message={newAnnotation.current?.message || ''}
        popupVisible={popupVisible}
      />

      <AnnotationList />
    </div>
  )
}
