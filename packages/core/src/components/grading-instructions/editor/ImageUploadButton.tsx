import { useEditorEventCallback } from '@nytimes/react-prosemirror'
import React, { useRef, ChangeEvent, useContext } from 'react'
import { EditableProps } from '../../context/GradingInstructionContext'
import { QuestionContext } from '../../context/QuestionContext'

export function ImageUploadButton({ saveImage }: { saveImage: EditableProps['onSaveImage'] }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { displayNumber } = useContext(QuestionContext)
  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  const updateEditor = useEditorEventCallback((view, tempUrl, permanentUrl = undefined) => {
    const { state } = view
    const { doc } = state
    let tr = state.tr

    if (permanentUrl) {
      doc.descendants((node, pos) => {
        if (node.type.name === 'image' && node.attrs.src === tempUrl) {
          tr = tr.setNodeAttribute(pos, 'src', permanentUrl)
        }
      })
    } else {
      const imageNode = state.schema.nodes.image.create({ src: tempUrl })
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
      const tempUrl = URL.createObjectURL(file)
      updateEditor(tempUrl)
      event.target.value = ''
      try {
        const permanentUrl = await saveImage(file, displayNumber)
        updateEditor(tempUrl, permanentUrl)
      } catch (e) {
        console.error('error saving file', e)
        updateEditor(tempUrl, 'no-image')
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
