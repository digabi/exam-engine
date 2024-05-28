import React, { useContext, useEffect, useState } from 'react'
import { AnnotationContext } from '../context/AnnotationProvider'
import { ExamAnnotation } from '../../types/Score'

export function AnnotationPopup() {
  const [comment, setComment] = useState<string>('')

  const popupRef = React.createRef<HTMLElement>()
  const textAreaRef = React.createRef<HTMLTextAreaElement>()
  const { newAnnotation, setNewAnnotation, newAnnotationRef, onSaveAnnotation } = useContext(AnnotationContext)

  useEffect(() => {
    console.log('newmark changed')
    if (newAnnotationRef) {
      showAndPositionElement(newAnnotationRef, popupRef)
      textAreaRef.current?.focus()
    }
  }, [newAnnotationRef])

  const closeEditor = () => setNewAnnotation(null)

  function updateComment(annotation: ExamAnnotation, comment: string) {
    onSaveAnnotation!({ ...annotation, message: comment, annotationId: annotation.annotationId })
    closeEditor()
  }

  if (!newAnnotation) {
    return null
  }

  return (
    <span className="annotation-popup" style={{ position: 'absolute', opacity: 0 }} ref={popupRef}>
      <textarea
        className="comment-content"
        data-testid="edit-comment"
        role="textbox"
        aria-multiline="true"
        onChange={e => setComment(e.target.value)}
        value={comment}
        ref={textAreaRef}
      />
      <span className="comment-button-area">
        <span>
          <button
            className="button"
            onClick={e => {
              e.stopPropagation()
              updateComment(newAnnotation, comment)
            }}
            data-testid="save-comment"
            disabled={comment.trim().length === 0}
          >
            Vastaa
          </button>
          <button className="button text-button" onClick={closeEditor}>
            Peru
          </button>
        </span>
      </span>
    </span>
  )
}
function showAndPositionElement(mark: HTMLElement | null, popupRef: React.RefObject<HTMLElement>) {
  const popup = popupRef.current
  if (mark && popup) {
    const style = popup.style
    const markRect = mark?.getBoundingClientRect()
    const popupRect = popup.getBoundingClientRect()
    const top = markRect.height + markRect.top + window.scrollY
    const windowWidth = window.innerWidth
    style.top = `${String(top)}px`
    style.opacity = '1'
    const popupHitsWindowRight = markRect.left + popupRect.width > windowWidth

    if (popupHitsWindowRight) {
      style.left = `${markRect.right - popupRect.width}px`
    } else {
      style.left = `${markRect.left}px`
    }
  }
}
