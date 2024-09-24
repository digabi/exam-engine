import { render } from '@testing-library/react'
import { GradingInstructionProvider } from '../../src/components/grading-instructions/GradingInstructionProvider'
import EditableGradingInstruction from '../../src/components/grading-instructions/EditableGradingInstruction'
import React from 'react'
import { withCommonExamContext } from '../../src/components/context/CommonExamContext'
import { EditableProps } from '../../src/components/context/GradingInstructionContext'
import { CommonExamProps } from '../../src/components/exam/Exam'

const WrappedGradingInstructionProvider = withCommonExamContext<EditableProps & CommonExamProps>(
  GradingInstructionProvider
)

export function renderGradingInstruction(inputData: string, onContentChangeMock = () => {}) {
  const doc = new DOMParser().parseFromString(inputData, 'text/html')
  return render(
    <WrappedGradingInstructionProvider
      editable={true}
      onContentChange={onContentChangeMock}
      saveScreenshot={() => Promise.resolve('')}
      answers={[]}
      attachmentsURL=""
      resolveAttachment={filename => filename}
      doc={doc}
    >
      <EditableGradingInstruction element={doc.documentElement} />x
    </WrappedGradingInstructionProvider>
  )
}
