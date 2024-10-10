import { act as testAct } from '@testing-library/react'
import { mockCreateRange } from '../utils/prosemirror'
import { renderGradingInstruction } from '../utils/renderEditableGradingInstruction'
import { insertText } from '../utils/util'

const act = testAct as (func: () => Promise<void>) => Promise<void>

describe('Editor - BR', () => {
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

  it('BR is rendered as expected', () => {
    const inputData = '<p>bar<br/></p>'
    const expectedOutput = '<p>bar<br><br class="ProseMirror-trailingBreak"></p>'
    const result = renderGradingInstruction(inputData)
    const table = result.container.querySelector('.ProseMirror')
    expect(table!.innerHTML).toBe(expectedOutput)
  })

  it('Change in content causes BR to be returned as expected', async () => {
    cleanup = mockCreateRange()
    const inputData = '<p>foo<br/></p><p>bar</p>'
    const expectedOutput = '<p>foo<br/></p><p>foo</p>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await act(async () => {
      insertText(await result.findByText('bar'), 'foo')
    })
    expect(onContentChangeMock).toHaveBeenCalledTimes(1)
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })
})
