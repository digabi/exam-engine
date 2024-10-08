import { fireEvent, act as testAct } from '@testing-library/react'
import { mockCreateRange } from '../utils/prosemirror'
import { renderGradingInstruction } from '../utils/renderEditableGradingInstruction'

const act = testAct as (func: () => Promise<void>) => Promise<void>

describe('Editor - span with lang attribute', () => {
  let cleanup: (() => void) | null
  let onContentChangeMock: jest.Mock

  beforeEach(() => {
    onContentChangeMock = jest.fn()
    cleanup = mockCreateRange()
  })

  afterEach(() => {
    if (cleanup) {
      cleanup()
    }
    cleanup = null
  })

  it('span with lang attribute is rendered and returned as expected', async () => {
    const inputData = '<p>bar</p><span lang="en-GB">foo</span>'
    const expectedDom = '<p>foo</p><p><span lang="en-GB">foo</span></p>'
    const expectedOutput = '<p>foo</p><p><span lang="en-GB">foo</span></p>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await act(async () => {
      insertText(await result.findByText('bar'), 'foo')
    })
    const element = result.container.querySelector('.ProseMirror')
    expect(element!.innerHTML).toBe(expectedDom)
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })
})

function insertText(element: HTMLElement, text: string) {
  fireEvent.input(element, {
    target: { innerText: text, innerHTML: text }
  })
}
