import { fireEvent, act as testAct } from '@testing-library/react'
import { mockCreateRange } from '../utils/prosemirror'
import { renderGradingInstruction } from '../utils/renderEditableGradingInstruction'

const act = testAct as (func: () => Promise<void>) => Promise<void>

describe('Editor - e-nowrap', () => {
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

  it('e-nowrap is rendered and returned as expected outside paragraph', async () => {
    const inputData = '<p>bar</p><span class="e-nowrap">foo</span>'
    const expectedDom = '<p>foo</p><p><span class="e-nowrap">foo</span></p>'
    const expectedOutput = '<p>foo</p><p><span class="e-nowrap">foo</span></p>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await act(async () => {
      insertText(await result.findByText('bar'), 'foo')
    })
    const element = result.container.querySelector('.ProseMirror')
    expect(element!.innerHTML).toBe(expectedDom)
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('e:formula is rendered as expected when wrapped inside e-nowrap', async () => {
    const inputData = '<p>bar</p><span class="e-nowrap"><e:formula data-editor-id=e-formula>foo</e:formula></span>'
    const expectedDom =
      '<p>foo</p><p><span class="e-nowrap"><img alt="foo" formula="true" src="/math.svg?latex=foo"><img class="ProseMirror-separator" alt=""></span><br class="ProseMirror-trailingBreak"></p>'
    const expectedOutput = '<p>foo</p><p><span class="e-nowrap"><e:formula>foo</e:formula></span></p>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await act(async () => {
      insertText(await result.findByText('bar'), 'foo')
    })
    const element = result.container.querySelector('.ProseMirror')
    expect(element!.innerHTML).toBe(expectedDom)
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('e-nowrap is rendered as expected inside paragraph', async () => {
    const inputData = '<p>bar</p><p><span class="e-nowrap">foo</span></p>'
    const expectedDom = '<p>foo</p><p><span class="e-nowrap">foo</span></p>'
    const expectedOutput = '<p>foo</p><p><span class="e-nowrap">foo</span></p>'
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
