import { render } from '@testing-library/react'
import { GradingInstructionProvider } from '../../src/components/grading-instructions/GradingInstructionProvider'
import EditableGradingInstruction from '../../src/components/grading-instructions/EditableGradingInstruction'
import React from 'react'

export function renderGradingInstruction(inputData: string, onContentChangeMock = () => {}) {
  const doc = new DOMParser().parseFromString(inputData, 'text/html')
  return render(
    <GradingInstructionProvider
      editable={true}
      onContentChange={onContentChangeMock}
      saveScreenshot={() => Promise.resolve('')}
    >
      <EditableGradingInstruction element={doc.documentElement} />
    </GradingInstructionProvider>
  )
}
