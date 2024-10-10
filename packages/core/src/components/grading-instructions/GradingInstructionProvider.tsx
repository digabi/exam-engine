import React from 'react'
import { GradingInstructionContext, GradingInstructionProps } from '../context/GradingInstructionContext'

export const GradingInstructionProvider = ({
  editable,
  onContentChange,
  onSaveImage,
  children
}: GradingInstructionProps) => {
  const contextValue = editable ? { editable, onContentChange, onSaveImage } : { editable }
  return <GradingInstructionContext.Provider value={contextValue}>{children}</GradingInstructionContext.Provider>
}
