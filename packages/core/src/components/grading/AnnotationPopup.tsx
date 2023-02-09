import React, { useEffect, useRef, useState } from 'react'

export const AnnotationPopup: React.FunctionComponent<{
  setMessage: (message: string) => void
  message: string
  popupVisible: boolean
  position: { left: number; top: number }
}> = ({ setMessage, message, popupVisible, position }) => {
  const popupRef = useRef<HTMLDivElement>(null)

  const [field, setField] = useState<string>('')

  useEffect(() => {
    setField(message)
  }, [message])

  return popupVisible ? (
    <div
      style={{
        display: popupVisible ? 'block' : 'none',
        position: 'absolute',
        left: position.left,
        top: position.top,
      }}
      className="popup"
      ref={popupRef}
    >
      <div className="popup add-annotation-popup">
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            onChange={(e) => setField(e.target.value)}
            value={field}
            className="add-annotation-text"
            type="text"
            autoFocus={true}
          />
          <i className="fa fa-comment"></i>
          <button type="submit" data-i18n="arpa.annotate" onClick={() => setMessage(field)}>
            Merkitse
          </button>
        </form>
      </div>
    </div>
  ) : (
    <></>
  )
}
