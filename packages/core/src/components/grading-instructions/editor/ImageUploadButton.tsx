import { useEditorEventCallback } from '@nytimes/react-prosemirror'
import React, { useRef, ChangeEvent, useContext } from 'react'
import { EditableProps } from '../../context/GradingInstructionContext'
import { QuestionContext } from '../../context/QuestionContext'
import { CommonExamContext } from '../../context/CommonExamContext'

export function ImageUploadButton({ saveImage }: { saveImage: EditableProps['onSaveImage'] }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { displayNumber } = useContext(QuestionContext)
  const { resolveAttachment } = useContext(CommonExamContext)
  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  const updateEditor = useEditorEventCallback((view, tempPath, permanentPath = undefined) => {
    const { state } = view
    const { doc } = state
    let tr = state.tr

    if (permanentPath) {
      doc.descendants((node, pos) => {
        if (node.type.name === 'image' && node.attrs.src === tempPath) {
          tr = tr.setNodeAttribute(pos, 'src', permanentPath)
        }
      })
    } else {
      const imageNode = state.schema.nodes.image.create({ src: tempPath })
      tr = tr.replaceSelectionWith(imageNode)
    }
    if (tr.steps.length > 0) {
      view.dispatch(tr)
    }
    view.focus()
  })

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const tempPath = URL.createObjectURL(file)
      updateEditor(tempPath)
      event.target.value = ''
      try {
        const permanentPath = await saveImage(file, displayNumber)
        if (!permanentPath) throw new Error('no permanent image url provided')
        updateEditor(tempPath, resolveAttachment(permanentPath))
      } catch (e) {
        console.error('error getting permanent url for image', e)
        updateEditor(tempPath, 'no-image')
      }
    }
  }

  return (
    <>
      <button onClick={handleButtonClick}>Lisää kuva</button>
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={inputRef}
        onChange={e => void handleFileChange(e)}
        data-testid="image-upload-button"
      />
    </>
  )
}
