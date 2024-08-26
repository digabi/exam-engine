import React from 'react'

export interface GradingInstructionPropsBase {
  children?: React.ReactNode
}

export interface EditableProps extends GradingInstructionPropsBase {
  editable: true
  onContentChange: (answerHTML: string, path: string, language: string, examType: string) => void
  saveScreenshot: (type: string, data: Buffer, displayNumber?: string) => Promise<string>
}

export interface NotEditableProps extends GradingInstructionPropsBase {
  editable?: false
  onContentChange?: never
  saveScreenshot?: never
}

export type GradingInstructionProps = EditableProps | NotEditableProps

export const GradingInstructionContext = React.createContext({} as GradingInstructionProps)
