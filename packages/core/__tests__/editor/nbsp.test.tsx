import React from 'react'
import { fireEvent, render, act as testAct } from '@testing-library/react'
import EditableGradingInstruction from '../../src/components/grading-instructions/EditableGradingInstruction'
import { GradingInstructionProvider } from '../../src/components/grading-instructions/GradingInstructionProvider'
import { mockCreateRange } from '../utils/prosemirror'

const act = testAct as (func: () => Promise<void>) => Promise<void>

describe('Editor - NBSP', () => {
  let cleanup: (() => void) | null
  let onContentChangeMock: jest.Mock

  beforeEach(() => {
    onContentChangeMock = jest.fn()
  })

  afterEach(() => {
    if (cleanup) {
      cleanup()
    }
    cleanup = null
  })

  it('NBSP is rendered as expected', () => {
    const inputData = '<p>&#160;bar</p>'
    const expectedOutput = '<p>&nbsp;bar</p>'
    const result = renderGradinginstruction(inputData)
    const table = result.container.querySelector('.ProseMirror')
    expect(table!.innerHTML).toBe(expectedOutput)
  })

  it('Change in content causes NBSP to be returned as expected', async () => {
    cleanup = mockCreateRange()
    const inputData = '<p>&#160;foo</p><p>bar</p>'
    const expectedOutput = '<p>&#160;foo</p><p>foo</p>'
    const result = renderGradinginstruction(inputData, onContentChangeMock)
    await act(async () => {
      insertText(await result.findByText('bar'), 'foo')
    })
    expect(onContentChangeMock).toHaveBeenCalledTimes(1)
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })
})

function insertText(element: HTMLElement, text: string) {
  fireEvent.input(element, {
    target: { innerText: text, innerHTML: text }
  })
}

function renderGradinginstruction(inputData: string, onContentChangeMock = () => {}) {
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
