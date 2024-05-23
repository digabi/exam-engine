import React, { useState } from 'react'

export function CreateAnnotationPopup({
  updateComment,
  closeEditor
}: {
  updateComment: (value: string) => void
  closeEditor: () => void
}) {
  const [comment, setComment] = useState<string>('')

  return (
    <span className="annotation-popup" style={{ position: 'absolute' }}>
      <textarea
        className="comment-content"
        role="textbox"
        aria-multiline="true"
        onChange={e => setComment(e.target.value)}
        value={comment}
        autoFocus={true}
      />
      <span className="comment-button-area">
        <span>
          <button onClick={() => updateComment(comment)} disabled={comment.trim().length === 0}>
            Vastaa
          </button>
          <button className="text-button" onClick={() => closeEditor()}>
            Peru
          </button>
        </span>
      </span>
    </span>
  )
}
