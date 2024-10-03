import { useEditorEventCallback } from '@nytimes/react-prosemirror'
import React, { useRef, ChangeEvent, useContext } from 'react'
import { EditableProps } from '../../context/GradingInstructionContext'
import { QuestionContext } from '../../context/QuestionContext'
import { CommonExamContext } from '../../context/CommonExamContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage } from '@fortawesome/free-solid-svg-icons'

enum EditorAction {
  REMOVE_IMAGE = 'REMOVE_IMAGE',
  UPDATE_IMAGE = 'UPDATE_IMAGE',
  INSERT_IMAGE = 'INSERT_IMAGE'
}

export function ImageUploadButton({ saveImage }: { saveImage: EditableProps['onSaveImage'] }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { displayNumber } = useContext(QuestionContext)
  const { resolveAttachment } = useContext(CommonExamContext)
  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  const updateEditor = useEditorEventCallback(
    (view, action: EditorAction, tempPath: string, permanentPath?: string) => {
      const { state } = view
      const {
        doc,
        schema: { nodes }
      } = state
      let tr = state.tr

      switch (action) {
        case EditorAction.INSERT_IMAGE:
          tr = tr.replaceSelectionWith(nodes.image.create({ src: tempPath }))
          break
        case EditorAction.UPDATE_IMAGE:
          doc.descendants((node, pos) => {
            if (node.type.name === 'image' && node.attrs.src === tempPath) {
              tr = tr.setNodeAttribute(pos, 'src', permanentPath)
            }
          })
          break
        case EditorAction.REMOVE_IMAGE:
          doc.descendants((node, pos) => {
            if (node.type.name === 'image' && node.attrs.src === tempPath) {
              tr = tr.delete(pos, pos + node.nodeSize)
            }
          })
          break
        default:
          console.error('Unsupported action:', action)
      }
      if (tr.steps.length > 0) {
        view.dispatch(tr)
      }
      view.focus()
    }
  )

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const tempPath = URL.createObjectURL(file)
      updateEditor(EditorAction.INSERT_IMAGE, tempPath)
      event.target.value = ''
      try {
        const permanentPath = await saveImage(file, displayNumber)
        if (!permanentPath) throw new Error('no permanent image path provided')
        updateEditor(EditorAction.UPDATE_IMAGE, tempPath, resolveAttachment(permanentPath))
      } catch (e) {
        console.error('error getting permanent path for image', e)
        updateEditor(EditorAction.REMOVE_IMAGE, tempPath)
      }
    }
  }

  return (
    <>
      <button onClick={handleButtonClick}>
        {' '}
        <FontAwesomeIcon size="lg" icon={faImage} className="editor-menu-icon" fixedWidth />
      </button>
      <input
        type="file"
        accept="image/png, image/jpeg, image/tiff"
        style={{ display: 'none' }}
        ref={inputRef}
        onChange={e => void handleFileChange(e)}
        data-testid="image-upload-button"
      />
    </>
  )
}
