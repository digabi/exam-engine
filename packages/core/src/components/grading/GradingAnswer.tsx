import React, { FormEvent, useLayoutEffect, useRef } from 'react'
import { Annotation, TextAnnotation } from '../..'
import AnnotationList from '../results/internal/AnnotationList'
import {
  calculatePosition,
  getPopupCss,
  hasTextSelectedInAnswerText,
  mergeAnnotation,
  selectionHasNothingToUnderline,
} from './editAnnotations'
import { renderAnnotations } from '../../renderAnnotations'

type Annotations = { pregrading: Annotation[]; censoring: Annotation[] }
export const GradingAnswer: React.FunctionComponent<{
  type: 'richText' | 'text'
  value: string
  annotations: Annotations
  saveAnnotations: (annotations: Annotations) => void
}> = ({ type, annotations, saveAnnotations, value }) => {
  const answerRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const messageRef = useRef<HTMLInputElement>(null)
  let newAnnotation: TextAnnotation

  let latestSavedAnnotations: Annotations

  useLayoutEffect(() => {
    if (answerRef.current) {
      latestSavedAnnotations = annotations
      renderAnswerWithAnnotations(latestSavedAnnotations)
    }
  })

  function onMouseUp() {
    const selection = window.getSelection()
    if (selection && answerRef.current !== null && hasTextSelectedInAnswerText()) {
      const range = selection.getRangeAt(0)
      if (selectionHasNothingToUnderline(range)) {
        return
      }
      const position = calculatePosition(answerRef.current, range)
      newAnnotation = { ...position, type: 'text', message: '' }
      Object.assign(popupRef.current!.style, getPopupCss(range, answerRef.current), {
        display: 'block',
      })
      const inputElement = messageRef.current!
      inputElement.value = ''
      inputElement.focus()
      renderAnswerWithAnnotations({
        pregrading: latestSavedAnnotations.pregrading,
        censoring: mergeAnnotation(answerRef.current, newAnnotation, latestSavedAnnotations.censoring),
      })
    }
  }

  function renderAnswerWithAnnotations(annotations: Annotations) {
    answerRef.current!.innerHTML = value
    renderAnnotations(answerRef.current!, annotations.pregrading, annotations.censoring)
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    newAnnotation.message = messageRef.current!.value
    latestSavedAnnotations = {
      pregrading: latestSavedAnnotations.pregrading,
      censoring: mergeAnnotation(answerRef.current!, newAnnotation, latestSavedAnnotations.censoring || []),
    }
    saveAnnotations(latestSavedAnnotations)
    renderAnswerWithAnnotations(latestSavedAnnotations)
    popupRef.current!.style.display = 'none'
  }
  return (
    <div
      style={{ position: 'relative' }}
      className="e-multiline-results-text-answer e-line-height-l e-pad-l-2 e-mrg-b-1"
    >
      {type === 'richText' ? (
        <div onMouseUp={onMouseUp} ref={answerRef} />
      ) : (
        <span className="text-answer text-answer--single-line">
          <span className="e-inline-block" onMouseUp={onMouseUp} ref={answerRef}></span>
        </span>
      )}
      <div style={{ display: 'none', position: 'absolute' }} ref={popupRef} className="popup add-annotation-popup">
        <form onSubmit={(e) => onSubmit(e)}>
          <input name="message" className="add-annotation-text" type="text" ref={messageRef} />
          <i className="fa fa-comment"></i>
          <button type="submit" data-i18n="arpa.annotate">
            Merkitse
          </button>
        </form>
      </div>
      <AnnotationList />
    </div>
  )
}
