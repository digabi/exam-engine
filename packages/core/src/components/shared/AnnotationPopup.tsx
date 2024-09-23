import React, { useContext } from 'react'
import { AnnotationContext } from '../context/AnnotationProvider'
import { Popup } from './Popup'

export function AnnotationPopup() {
  const { newAnnotation, setNewAnnotation, newAnnotationRef, setNewAnnotationRef, onSaveAnnotation } =
    useContext(AnnotationContext)
  return (
    <Popup
      element={newAnnotationRef}
      initialTextContent={''}
      onValueSave={(comment: string) => {
        onSaveAnnotation!(newAnnotation!, comment)
        setNewAnnotation(null)
        setNewAnnotationRef(null)
      }}
      enableDelete={false}
      onCancel={() => {
        setNewAnnotation(null)
        setNewAnnotationRef(null)
      }}
    />
  )
}
