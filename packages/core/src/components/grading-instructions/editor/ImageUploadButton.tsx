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

  const updateEditor = useEditorEventCallback((view, blobUrl, permanentUrl = undefined) => {
    const { state } = view
    const { doc } = state
    let tr = state.tr

    if (permanentUrl) {
      doc.descendants((node, pos) => {
        if (node.type.name === 'image' && node.attrs.src === blobUrl) {
          tr = tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            src: permanentUrl
          })
        }
      })
    } else {
      const imageNode = state.schema.nodes.image.create({ src: blobUrl })
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
      const blobUrl = URL.createObjectURL(file)
      updateEditor(blobUrl)
      try {
        const permanentUrl = await saveImage('', Buffer.from(await file.arrayBuffer()))
        updateEditor(blobUrl, permanentUrl)
      } catch (e) {
        console.error('error saving file', e)
        updateEditor(blobUrl, 'no-image')
      }
    }
  }

  return (
    <>
      <button onClick={handleButtonClick}>Lataa kuva</button>
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
