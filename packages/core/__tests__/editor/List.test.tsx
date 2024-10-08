import { act as testAct } from '@testing-library/react'
import { mockCreateRange } from '../utils/prosemirror'
import { renderGradingInstruction } from '../utils/renderEditableGradingInstruction'
import userEvent from '@testing-library/user-event'
import { insertText } from '../utils/util'

const act = testAct as (func: () => Promise<void>) => Promise<void>

describe('Editor - List', () => {
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

  it('Bullet list is rendered as expected', () => {
    const inputData = '<p>bar</p><ul><li>foo</li></ul>'
    const expectedDom = '<p>bar</p><ul><li><p>foo</p></li></ul>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    const table = result.container.querySelector('.ProseMirror')
    expect(table!.innerHTML).toBe(expectedDom)
  })

  it('Ordered list is rendered as expected', () => {
    const inputData = '<p>bar</p><ol><li>foo</li></ol>'
    const expectedDom = '<p>bar</p><ol><li><p>foo</p></li></ol>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    const table = result.container.querySelector('.ProseMirror')
    expect(table!.innerHTML).toBe(expectedDom)
  })

  it('Change in content causes bullet list to be returned as expected', async () => {
    cleanup = mockCreateRange()
    const inputData = '<p>bar</p><ul><li>foo</li></ul>'
    const expectedOutput = '<p>foo</p><ul><li><p>foo</p></li></ul>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await act(async () => {
      insertText(await result.findByText('bar'), 'foo')
    })
    expect(onContentChangeMock).toHaveBeenCalledTimes(1)
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('Change in content causes ordered list to be returned as expected', async () => {
    cleanup = mockCreateRange()
    const inputData = '<p>bar</p><ol><li>foo</li></ol>'
    const expectedOutput = '<p>foo</p><ol><li><p>foo</p></li></ol>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await act(async () => {
      insertText(await result.findByText('bar'), 'foo')
    })
    expect(onContentChangeMock).toHaveBeenCalledTimes(1)
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('Insert bullet list adds expected string', async () => {
    cleanup = mockCreateRange()
    const inputData = '<p>foo</p><p>bar</p>'
    const expectedOutput = '<p></p><ul><li><p></p></li></ul><p>foo</p><p>bar</p>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await act(async () => {
      await userEvent.click(await result.findByTestId('editor-menu-add-bullet_list'))
    })
    expect(onContentChangeMock).toHaveBeenCalledTimes(1)
    expect(onContentChangeMock).toHaveBeenLastCalledWith(expectedOutput, '')
  })
})
