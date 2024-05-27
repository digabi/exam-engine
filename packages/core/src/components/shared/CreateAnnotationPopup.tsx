import React, { useEffect, useState } from 'react'

export function CreateAnnotationPopup({
  updateComment,
  closeEditor,
  markRef
}: {
  updateComment: (value: string) => void
  closeEditor: () => void
  markRef: React.RefObject<HTMLElement>
}) {
  const [comment, setComment] = useState<string>('')

  const popupRef = React.createRef<HTMLElement>()

  useEffect(() => {
    showAndPositionElement(markRef, popupRef)
  }, [])

  return (
    <span className="annotation-popup" style={{ position: 'absolute' }} ref={popupRef}>
      <textarea
        className="comment-content"
        data-testid="edit-comment"
        role="textbox"
        aria-multiline="true"
        onChange={e => setComment(e.target.value)}
        value={comment}
        autoFocus={true}
      />
      <span className="comment-button-area">
        <span>
          <button
            className="button"
            onClick={e => {
              e.stopPropagation()
              updateComment(comment)
            }}
            data-testid="save-comment"
            disabled={comment.trim().length === 0}
          >
            Vastaa
          </button>
          <button className="button text-button" onClick={() => closeEditor()}>
            Peru
          </button>
        </span>
      </span>
    </span>
  )
}

function showAndPositionElement(markRef: React.RefObject<HTMLElement>, popupRef: React.RefObject<HTMLElement>) {
  const mark = markRef.current
  const popup = popupRef.current
  if (mark && popup) {
    const style = popup.style
    const markRect = mark?.getBoundingClientRect()
    const popupRect = popup.getBoundingClientRect()
    const top = markRect.height
    const windowWidth = window.innerWidth
    const popupHitsWindowRight = popupRect.right > windowWidth
    style.top = `${String(top)}px`
    if (popupHitsWindowRight) {
      style.right = '0'
    } else {
      style.left = '0'
    }
  }
}
