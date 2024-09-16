import { useEditorEventCallback } from '@nytimes/react-prosemirror'
import React, { useRef, ChangeEvent, useState } from 'react'

export function ImageUploadButton() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)

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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Create a Blob URL for local preview
      const blobUrl = URL.createObjectURL(file)
      setUploading(true)
      updateEditor(blobUrl)

      try {
        // Upload the file to S3 using the presigned URL
        // Replace the Blob URL with the S3 URL
      } catch (error) {
        console.error('Error uploading file:', error)
      } finally {
        setUploading(false)
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
      {uploading && <p>Uploading...</p>}
    </>
  )
}
