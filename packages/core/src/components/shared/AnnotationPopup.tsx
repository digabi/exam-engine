import React, { useContext, useEffect, useState } from 'react'
import { makeRichText } from 'rich-text-editor'
import { NewExamAnnotation } from '../../types/Score'
import { AnnotationContext } from '../context/AnnotationProvider'
import { closeMathEditor, showAndPositionElement } from './PopupUtils'

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
