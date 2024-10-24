import React, { useEffect, useState } from 'react'
import RichTextEditor from 'rich-text-editor'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'

type PopupProps = {
  element: Element | null
  initialTextContent: string
  onValueChange?: (text: string) => string | null
  onValueSave: (text: string) => void
  enableDelete: boolean
  onDelete?: () => void
  onCancel: () => void
}

export function Popup(props: PopupProps) {
  const popupRef = React.createRef<HTMLDivElement>()
  const [textContent, setTextContent] = useState<string>(props.initialTextContent || '')
  const [saveEnabled, setSaveEnabled] = useState<boolean>(false)
  const [verifyDelete, setVerifyDelete] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (props.element) {
      showAndPositionElement(props.element, popupRef)
    }
    setTextContent(props.initialTextContent || '')
    setSaveEnabled(props.initialTextContent.length > 0)
  }, [props.element])

  if (!props.element) {
    return null
  }

  return (
    <div className="e-popup" style={{ position: 'absolute', opacity: 0 }} ref={popupRef} data-testid="e-popup">
      <RichTextEditor
        language="FI"
        baseUrl={''}
        initialValue={props.initialTextContent}
        getPasteSource={() => Promise.resolve('')}
        onValueChange={value => {
          if (props.onValueChange) {
            const error = props.onValueChange(value.answerHtml)
            setErrorMessage(error)
          }
          setTextContent(value.answerHtml)
          setSaveEnabled(value.answerHtml.trim().length > 0)
        }}
        textAreaProps={{
          className: 'comment-content'
        }}
      />{' '}
      {errorMessage && <span className="e-popup-error">{errorMessage}</span>}
      <span className="e-popup-button-area">
        <span>
          <button
            className="button"
            onClick={e => {
              e.stopPropagation()
              props.onValueSave(textContent)
            }}
            data-testid="e-popup-save"
            disabled={!saveEnabled || !!errorMessage}
          >
            Tallenna
          </button>
          <button
            className="button text-button"
            data-testid="e-popup-cancel"
            onClick={() => {
              props.onCancel()
            }}
          >
            Peru
          </button>
        </span>
        {props.enableDelete && (
          <button
            className={classNames('button', 'e-popup-delete', 'round', { confirm: verifyDelete })}
            data-testid="e-popup-delete"
            onClick={() => {
              if (!verifyDelete) {
                setVerifyDelete(true)
              } else {
                if (props.onDelete) {
                  props.onDelete()
                }
              }
            }}
          >
            <FontAwesomeIcon size="lg" icon={faTrashCan} fixedWidth /> {verifyDelete && 'Vahvista?'}
          </button>
        )}
      </span>
    </div>
  )
}

export function showAndPositionElement(mark: Element | null, popupRef: React.RefObject<HTMLElement>) {
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
