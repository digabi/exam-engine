import React, { useContext, useEffect, useState } from 'react'
import { NewExamAnnotation } from '../../types/Score'
import { AnnotationContext } from '../context/AnnotationProvider'
import RichTextEditor from 'rich-text-editor'

export function AnnotationPopup() {
  const popupRef = React.createRef<HTMLDivElement>()
  const { newAnnotation, setNewAnnotation, newAnnotationRef, onSaveAnnotation } = useContext(AnnotationContext)
  const [comment, setComment] = useState<string>('')
  const [saveEnabled, setSaveEnabled] = useState<boolean>(false)

  useEffect(() => {
    if (newAnnotationRef) {
      showAndPositionElement(newAnnotationRef, popupRef)
    }
  }, [newAnnotationRef])

  if (!newAnnotation) {
    if (comment) {
      setComment('')
    }
    return null
  }

  const closeEditor = () => {
    setNewAnnotation(null)
  }

  function createNewAnnotation(annotation: NewExamAnnotation, comment: string) {
    onSaveAnnotation!(annotation, comment)
    closeEditor()
  }

  return (
    <div
      className="annotation-popup"
      style={{ position: 'absolute', opacity: 0 }}
      ref={popupRef}
      data-testid="annotation-popup"
    >
      <RichTextEditor
        language="FI"
        baseUrl={''}
        initialValue={comment}
        onValueChange={answer => {
          setComment(answer.answerHtml)
          setSaveEnabled(answer.answerHtml.trim().length > 0)
        }}
      />
      <span className="comment-button-area">
        <span>
          <button
            className="button"
            onClick={e => {
              e.stopPropagation()
              createNewAnnotation(newAnnotation, comment)
            }}
            data-testid="save-comment"
            disabled={!saveEnabled}
          >
            Tallenna
          </button>
          <button className="button text-button" onClick={closeEditor}>
            Peru
          </button>
        </span>
      </span>
    </div>
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
