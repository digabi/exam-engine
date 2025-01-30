import React, { useContext } from 'react'
import { AnnotationContext } from '../context/AnnotationProvider'
import { Popup } from './Popup'

export function AnnotationPopup() {
  const annotationContext = useContext(AnnotationContext)

  if (
    !annotationContext.annotationsEnabled ||
    !annotationContext.newAnnotation ||
    !annotationContext.newAnnotationRef
  ) {
    return null
  }

  const { newAnnotation, newAnnotationRef, setNewAnnotation, setNewAnnotationRef, onSaveAnnotation } = annotationContext

  return (
    <Popup
      element={newAnnotationRef}
      initialTextContent={''}
      onValueSave={async (comment: string) => {
        const error = await onSaveAnnotation(newAnnotation, comment)
        if (!error) {
          setNewAnnotation(null)
          setNewAnnotationRef(null)
        }
        return error
      }}
      enableDelete={false}
      onCancel={() => {
        setNewAnnotation(null)
        setNewAnnotationRef(null)
      }}
    />
  )
}
