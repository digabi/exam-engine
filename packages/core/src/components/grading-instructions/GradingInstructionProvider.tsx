import React from 'react'
import { GradingInstructionContext, GradingInstructionProps } from '../context/GradingInstructionContext'

export const GradingInstructionProvider = ({
  EditorComponent,
  onContentChange,
  onSaveImage,
  children
}: GradingInstructionProps) => {
  const contextValue = EditorComponent
    ? { EditorComponent, onContentChange: onContentChange, onSaveImage }
    : { EditorComponent }
  return <GradingInstructionContext.Provider value={contextValue}>{children}</GradingInstructionContext.Provider>
}
