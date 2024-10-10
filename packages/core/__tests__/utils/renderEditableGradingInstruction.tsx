import { render } from '@testing-library/react'
import { GradingInstructionProvider } from '../../src/components/grading-instructions/GradingInstructionProvider'
import EditableGradingInstruction from '../../src/components/grading-instructions/EditableGradingInstruction'
import React from 'react'
import { withCommonExamContext } from '../../src/components/context/CommonExamContext'
import { EditableProps } from '../../src/components/context/GradingInstructionContext'
import { CommonExamProps } from '../../src/components/exam/Exam'

export const mockedPermanentUrl = 'mocked-permanent-url'
export const mockedResolvedPath = 'mock-resolved-path'

const WrappedGradingInstructionProvider = withCommonExamContext<EditableProps & CommonExamProps>(
  GradingInstructionProvider
)

export function renderGradingInstruction(inputData: string, onContentChangeMock = () => {}) {
  const doc = new DOMParser().parseFromString(inputData, 'text/html')
  return render(
    <WrappedGradingInstructionProvider
      editable={true}
      onContentChange={onContentChangeMock}
      onSaveImage={() => Promise.resolve(mockedPermanentUrl)}
      answers={[]}
      attachmentsURL=""
      resolveAttachment={filename => `/${mockedResolvedPath}/${filename}`}
      doc={doc}
    >
      <EditableGradingInstruction element={doc.documentElement} />x
    </WrappedGradingInstructionProvider>
  )
}
