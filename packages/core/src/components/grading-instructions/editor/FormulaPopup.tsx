import React, { useEffect, useState } from 'react'
import { makeRichText } from 'rich-text-editor'
import { useEditorEventCallback } from '@nytimes/react-prosemirror'
import { FormulaEditorState } from './Formula'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { closeMathEditor, showAndPositionElement } from '../../shared/PopupUtils'
import classNames from 'classnames'

export function FormulaPopup({ state, onFinish }: { state: FormulaEditorState; onFinish: () => void }) {
  const popupRef = React.createRef<HTMLDivElement>()
  const textAreaRef = React.createRef<HTMLDivElement>()
  const initialValue = state.latex.length
    ? `<img alt="${state.latex}" src="/math.svg?latex=${encodeURIComponent(state.latex)}">`
    : ''
  const [textField, setTextField] = useState<string>(initialValue)
  const [saveEnabled, setSaveEnabled] = useState<boolean>(false)
  const [dataError, setDataError] = useState<string>('')
  const [verifyDelete, setVerifyDelete] = useState<boolean>(false)

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.innerHTML = initialValue
      makeRichText(
        textAreaRef.current,
        {
          locale: 'FI',
          screenshotSaver: () => Promise.resolve('')
        },
        value => {
          if (value.answerHTML.length && !containsOnlyOneImgTag(value.answerHTML)) {
            setDataError('Ainoastaan yksi kaava sallittu')
          } else {
            setDataError('')
          }
          setTextField(value.answerHTML)
          setSaveEnabled(value.answerHTML.trim().length > 0)
        }
      )
      showAndPositionElement(state.element, popupRef)
      textAreaRef.current.focus()
    }
  }, [state.latex])

  const closeEditor = () => {
    onFinish()
    closeMathEditor(textAreaRef.current!)
  }

  const onContentChange = useEditorEventCallback((view, textField: string) => {
    const latex = extractLatex(textField) || ''
    const { schema } = view.state
    const node = view.state.doc.nodeAt(state.pos)
    if (node) {
      const tr = latex.trim().length
        ? view.state.tr.replaceWith(
            state.pos,
            state.pos + node.nodeSize,
            schema.node('formula', { ...node.attrs, ...{ latex } })
          )
        : view.state.tr.delete(state.pos, state.pos + node.nodeSize)
      view.dispatch(tr)

      onFinish()
    }
  })

  return (
    <div className="formula-popup" style={{ position: 'absolute', opacity: 1 }} ref={popupRef}>
      <div className="formula-popup-content" role="textbox" aria-multiline="true" ref={textAreaRef} />
      {dataError && <span className="formula-popup-error">{dataError}</span>}
      <span className="formula-button-area">
        <span>
          <button
            className="button"
            data-testid="save-formula"
            onClick={e => {
              e.stopPropagation()
              closeMathEditor(textAreaRef.current!)
              onContentChange(textField)
            }}
            disabled={!saveEnabled || !!dataError}
          >
            Tallenna
          </button>
          <button className="button text-button" onClick={closeEditor} data-testid="cancel-formula-changes">
            Peru
          </button>
        </span>
        <button
          className={classNames('button', 'formula-delete-button', 'round', { confirm: verifyDelete })}
          data-testid="delete-formula"
          onClick={() => {
            if (!verifyDelete) {
              setVerifyDelete(true)
            } else {
              closeMathEditor(textAreaRef.current!)
              onContentChange('')
            }
          }}
        >
          <FontAwesomeIcon size="lg" icon={faTrashCan} fixedWidth /> {verifyDelete && 'Vahvista?'}
        </button>
      </span>
    </div>
  )
}

function extractLatex(value: string) {
  const latexPattern = /alt="([^&]+)" src=/
  const latexMatch = value.match(latexPattern)

  if (!latexMatch || latexMatch.length < 2) {
    return
  }

  return decodeURIComponent(latexMatch[1])
}

function containsOnlyOneImgTag(htmlString: string) {
  const imgTagPattern = /^<img\s+[^>]*>$/g
  const matches = htmlString.trim().match(imgTagPattern)
  return matches && matches.length === 1
}
