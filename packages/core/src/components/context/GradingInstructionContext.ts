import React from 'react'

interface GradingInstructionContextProps {
  editable: boolean
  onContentChange: (answerHTML: string, displayNumber?: string) => void
  saveScreenshot?: (type: string, data: Buffer, displayNumber?: string) => Promise<string>
}

export const GradingInstructionContext = React.createContext({} as GradingInstructionContextProps)
