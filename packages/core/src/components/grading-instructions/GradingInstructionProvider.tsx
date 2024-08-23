import React from 'react'
import { GradingInstructionContext, GradingInstructionProps } from '../context/GradingInstructionContext'

export const GradingInstructionProvider = ({
  editable,
  onContentChange,
  saveScreenshot,
  children
}: GradingInstructionProps) => {
  const contextValue = editable ? { editable, onContentChange, saveScreenshot } : { editable }
  return <GradingInstructionContext.Provider value={contextValue}>{children}</GradingInstructionContext.Provider>
}
