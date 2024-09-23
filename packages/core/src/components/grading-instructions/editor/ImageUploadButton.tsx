import { useEditorEventCallback } from '@nytimes/react-prosemirror'
import React, { useRef, ChangeEvent } from 'react'
import { EditableProps } from '../../context/GradingInstructionContext'
import { Buffer } from 'buffer'

export function ImageUploadButton({ saveImage }: { saveImage: EditableProps['saveScreenshot'] }) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  const updateEditor = useEditorEventCallback((view, url) => {
    const { state } = view
    const imageNode = state.schema.nodes.image.create({ src: url })
    const transaction = view.state.tr.replaceSelectionWith(imageNode)
    view.dispatch(transaction)
    view.focus()
  })

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const blobUrl = URL.createObjectURL(file)
      updateEditor(blobUrl)
      try {
        const permanentUrl = await saveImage('', Buffer.from(await file.arrayBuffer()))
        updateEditor(permanentUrl)
      } catch (e) {
        console.error('error saving file', e)
      }
    }
  }

  return (
    <>
      <button onClick={handleButtonClick}>Upload Image</button>
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={inputRef}
        onChange={e => void handleFileChange(e)}
      />
    </>
  )
}
