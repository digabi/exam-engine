import { act as testAct } from '@testing-library/react'
import { renderGradingInstruction } from '../utils/renderEditableGradingInstruction'
import { insertText } from '../utils/util'
import userEvent from '@testing-library/user-event'
import { mockCreateRange } from '../utils/prosemirror'

const act = testAct as (func: () => Promise<void>) => Promise<void>

describe('Undo/Redo', () => {
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

  it('inserted text can be undone', async () => {
    const inputData = '<p>Testiteksti</p>'
    const expectedOutput = '<p>1234</p>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await act(async () => {
      insertText(await result.findByText('Testiteksti'), '1234')
    })
    expect(onContentChangeMock).toHaveBeenCalledTimes(1)
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
    await act(async () => {
      await userEvent.click(await result.findByTitle('kumoa muutokset'))
    })
    expect(onContentChangeMock).toHaveBeenCalledTimes(2)
    expect(onContentChangeMock).toHaveBeenCalledWith(inputData, '')
  })

  it('undone text can be redo', async () => {
    const inputData = '<p>Testiteksti</p>'
    const expectedOutput = '<p>1234</p>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await act(async () => {
      insertText(await result.findByText('Testiteksti'), '1234')
    })
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
    expect(onContentChangeMock).toHaveBeenCalledTimes(1)
    await act(async () => {
      await userEvent.click(await result.findByTitle('kumoa muutokset'))
    })
    expect(onContentChangeMock).toHaveBeenCalledTimes(2)
    expect(onContentChangeMock).toHaveBeenCalledWith(inputData, '')
    await act(async () => {
      await userEvent.click(await result.findByTitle('toista muutokset'))
    })
    expect(onContentChangeMock).toHaveBeenCalledTimes(3)
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })
})
