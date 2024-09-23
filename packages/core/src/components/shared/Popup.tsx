import React, { useEffect, useState } from 'react'
import { makeRichText } from 'rich-text-editor'
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
  const textAreaRef = React.createRef<HTMLDivElement>()
  const [textContent, setTextContent] = useState<string>(props.initialTextContent || '')
  const [saveEnabled, setSaveEnabled] = useState<boolean>(false)
  const [verifyDelete, setVerifyDelete] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (props.element && textAreaRef.current) {
      showAndPositionElement(props.element, popupRef)
      textAreaRef.current.innerHTML = textContent
      makeRichText(
        textAreaRef.current,
        {
          locale: 'FI',
          screenshotSaver: () => Promise.resolve('')
        },
        value => {
          if (props.onValueChange) {
            const error = props.onValueChange(value.answerHTML)
            setErrorMessage(error)
          }
          setTextContent(value.answerHTML)
          setSaveEnabled(value.answerHTML.trim().length > 0)
        }
      )
      textAreaRef.current.focus()
    }
    setTextContent('')
    setSaveEnabled(props.initialTextContent.length > 0)
  }, [props.element])

  if (!props.element) {
    return null
  }

  return (
    <div className="e-popup" style={{ position: 'absolute', opacity: 0 }} ref={popupRef} data-testid="e-popup">
      <div
        className="e-popup-content"
        data-testid="e-popup-content"
        role="textbox"
        aria-multiline="true"
        ref={textAreaRef}
      />
      {errorMessage && <span className="e-popup-error">{errorMessage}</span>}
      <span className="e-popup-button-area">
        <span>
          <button
            className="button"
            onClick={e => {
              e.stopPropagation()
              closeMathEditor(textAreaRef.current!)
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
              closeMathEditor(textAreaRef.current!)
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
                  closeMathEditor(textAreaRef.current!)
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

export function closeMathEditor(element: HTMLDivElement) {
  // rich-text-editor does not properly support several rich-text-editor instances created at different times.
  // In order to close math editor that is open, we need to dispatch events like this.
  element.dispatchEvent(new Event('focus', { bubbles: true, cancelable: true }))
  element.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }))
}
