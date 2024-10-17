import React from 'react'

export interface GradingInstructionPropsBase {
  children?: React.ReactNode
}

export type GradingInstructionProps = GradingInstructionPropsBase & {
  EditorComponent?: React.ComponentType<{ element: Element; displayNumber: string }>
}

export const GradingInstructionContext = React.createContext({} as GradingInstructionProps)
