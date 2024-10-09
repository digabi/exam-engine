import React from 'react'

export interface GradingInstructionPropsBase {
  children?: React.ReactNode
}

export interface EditableProps extends GradingInstructionPropsBase {
  EditorComponent: React.ComponentType<{ element: Element }>
  onContentChange: (answerHTML: string, path: string) => void
  onSaveImage: (file: File, displayNumber?: string) => Promise<string>
}

export interface NotEditableProps extends GradingInstructionPropsBase {
  EditorComponent?: null | undefined
  onContentChange?: never
  onSaveImage?: never
}

export type GradingInstructionProps = EditableProps | NotEditableProps

export const GradingInstructionContext = React.createContext({} as GradingInstructionProps)
