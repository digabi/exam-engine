import React, { useContext, useEffect, useState } from 'react'
import { makeRichText } from 'rich-text-editor'
import { NewExamAnnotation } from '../../types/Score'
import { AnnotationContext } from '../context/AnnotationProvider'

export function AnnotationPopup() {
  const popupRef = React.createRef<HTMLDivElement>()
  const textAreaRef = React.createRef<HTMLDivElement>()
  const { newAnnotation, setNewAnnotation, newAnnotationRef, onSaveAnnotation } = useContext(AnnotationContext)
  const [comment, setComment] = useState<string>('')
  const [saveEnabled, setSaveEnabled] = useState<boolean>(false)

  useEffect(() => {
    if (newAnnotationRef && textAreaRef.current) {
      showAndPositionElement(newAnnotationRef, popupRef)
      textAreaRef.current.innerHTML = comment
      makeRichText(
        textAreaRef.current,
        {
          locale: 'FI',
          screenshotSaver: () => Promise.resolve('')
        },
        value => {
          setComment(value.answerHTML)
          setSaveEnabled(value.answerHTML.trim().length > 0)
        }
      )
      textAreaRef.current.focus()
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
    closeMathEditor(textAreaRef.current!)
  }

  function updateComment(annotation: NewExamAnnotation, comment: string) {
    onSaveAnnotation!({ ...annotation, message: comment })
    closeEditor()
  }

  return (
    <div
      className="annotation-popup"
      style={{ position: 'absolute', opacity: 0 }}
      ref={popupRef}
      data-testid="annotation-popup"
    >
      <div
        className="comment-content"
        data-testid="edit-comment"
        role="textbox"
        aria-multiline="true"
        ref={textAreaRef}
      />
      <span className="comment-button-area">
        <span>
          <button
            className="button"
            onClick={e => {
              e.stopPropagation()
              closeMathEditor(textAreaRef.current!)
              updateComment(newAnnotation, comment)
            }}
            data-testid="save-comment"
            disabled={!saveEnabled}
          >
            Vastaa
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

function closeMathEditor(element: HTMLDivElement) {
  // rich-text-editor does not properly support several rich-text-editor instances created at different times.
  // In order to close math editor that is open, we need to dispatch events like this.
  element.dispatchEvent(new Event('focus', { bubbles: true, cancelable: true }))
  element.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }))
}
