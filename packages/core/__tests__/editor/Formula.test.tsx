import { act as testAct } from '@testing-library/react'
import { mockCreateRange } from '../utils/prosemirror'
import { renderGradingInstruction } from '../utils/renderEditableGradingInstruction'
import { insertText } from '../utils/util'

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
    const result = renderGradingInstruction(inputData)
    const table = result.container.querySelector('.ProseMirror')
    expect(table!.innerHTML).toBe(expectedOutput)
  })

  it('Change in content causes formula to be returned as expected', async () => {
    cleanup = mockCreateRange()
    const inputData =
      '<p>bar</p><p><e:formula data-editor-id="e-formula" mode="inline">foo</e:formula><e:formula data-editor-id="e-formula" assistive-title="foobar">bar</e:formula></p>'
    const expectedOutput =
      '<p>foo</p><p><e:formula mode="inline">foo</e:formula><e:formula assistive-title="foobar">bar</e:formula></p>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await act(async () => {
      insertText(await result.findByText('bar'), 'foo')
    })
    expect(onContentChangeMock).toHaveBeenCalledTimes(1)
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('Empty formula is removed when sending changed content', async () => {
    cleanup = mockCreateRange()
    const inputData = '<p>bar</p><p><e:formula data-editor-id="e-formula"></e:formula></p>'
    const expectedOutput = '<p>foo</p><p></p>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await act(async () => {
      insertText(await result.findByText('bar'), 'foo')
    })
    expect(onContentChangeMock).toHaveBeenCalledTimes(1)
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })
})
