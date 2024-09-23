import React from 'react'
import { fireEvent, render, act as testAct } from '@testing-library/react'
import EditableGradingInstruction from '../../src/components/grading-instructions/EditableGradingInstruction'
import { GradingInstructionProvider } from '../../src/components/grading-instructions/GradingInstructionProvider'
import { mockCreateRange } from '../utils/prosemirror'

const act = testAct as (func: () => Promise<void>) => Promise<void>

describe('Editor - Formula', () => {
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

  it('Formula is rendered as expected', () => {
    const inputData = '<p>bar <e:formula data-editor-id="e-formula">foo</e:formula></p>'
    const expectedOutput =
      '<p>bar <img alt="foo" src="/math.svg?latex=foo"><img class="ProseMirror-separator" alt=""><br class="ProseMirror-trailingBreak"></p>'
    const result = renderGradinginstruction(inputData)
    const table = result.container.querySelector('.ProseMirror')
    expect(table!.innerHTML).toBe(expectedOutput)
  })

  it('Change in content causes formula to be returned as expected', async () => {
    cleanup = mockCreateRange()
    const inputData = '<p>bar</p><p><e:formula data-editor-id="e-formula" mode="inline">foo</e:formula></p>'
    const expectedOutput = '<p>foo</p><p><e:formula mode="inline">foo</e:formula></p>'
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
