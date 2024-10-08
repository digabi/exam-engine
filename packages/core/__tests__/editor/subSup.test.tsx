import { fireEvent, act as testAct } from '@testing-library/react'
import { mockCreateRange } from '../utils/prosemirror'
import { renderGradingInstruction } from '../utils/renderEditableGradingInstruction'

const act = testAct as (func: () => Promise<void>) => Promise<void>

describe('Editor - sub and sup', () => {
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

  it('sub is rendered and returned as expected', async () => {
    const inputData = '<p>bar</p><sub>foo</sub>'
    const expectedDom = '<p>foo</p><p><sub>foo</sub></p>'
    const expectedOutput = '<p>foo</p><p><sub>foo</sub></p>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await act(async () => {
      insertText(await result.findByText('bar'), 'foo')
    })
    const element = result.container.querySelector('.ProseMirror')
    expect(element!.innerHTML).toBe(expectedDom)
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('sup is rendered and returned as expected', async () => {
    const inputData = '<p>bar</p><sup>foo</sup>'
    const expectedDom = '<p>foo</p><p><sup>foo</sup></p>'
    const expectedOutput = '<p>foo</p><p><sup>foo</sup></p>'
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
