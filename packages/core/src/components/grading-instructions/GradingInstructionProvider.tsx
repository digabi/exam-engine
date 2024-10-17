import React from 'react'
import { GradingInstructionContext, GradingInstructionProps } from '../context/GradingInstructionContext'

export const GradingInstructionProvider = ({ EditorComponent, children }: GradingInstructionProps) => (
  <GradingInstructionContext.Provider value={{ EditorComponent: EditorComponent }}>
    {children}
  </GradingInstructionContext.Provider>
)
