import React from 'react'
import { GradingInstructionContext } from '../context/GradingInstructionContext'

export interface GradingInstructionProps {
  children?: React.ReactNode
  editable?: boolean
  onContentChange?: (answerHTML: string, displayNumber?: string) => void
  saveScreenshot?: (type: string, data: Buffer, displayNumber?: string) => Promise<string>
}

export const GradingInstructionProvider = ({
  editable,
  onContentChange,
  saveScreenshot,
  children
}: GradingInstructionProps) => (
  <GradingInstructionContext.Provider
    value={{
      editable: editable ?? false,
      onContentChange: onContentChange ? onContentChange : () => {},
      saveScreenshot
    }}
  >
    {children}
  </GradingInstructionContext.Provider>
)
