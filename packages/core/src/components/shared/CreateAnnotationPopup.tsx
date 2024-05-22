import React, { useRef } from 'react'

export function CreateAnnotationPopup({
  updateComment,
  closeEditor
}: {
  updateComment: (value: string) => void
  closeEditor: () => void
}) {
  const commentTextArea = useRef<HTMLTextAreaElement>(null)

  return (
    <span className="annotation-popup" style={{ position: 'absolute' }}>
      <textarea ref={commentTextArea} className="comment-content" role="textbox" aria-multiline="true" />
      <span className="comment-button-area">
        <span>
          <button
            onClick={() => updateComment(commentTextArea?.current?.textContent || '')}
            disabled={commentTextArea?.current?.textContent === ''}
          >
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
