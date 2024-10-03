import { act as testAct, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderGradingInstruction } from '../utils/renderEditableGradingInstruction'
import { insertText } from '../utils/util'
import '@testing-library/jest-dom'

const act = testAct as (func: () => Promise<void>) => Promise<void>

describe('Table', () => {
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

  it('Table is rendered as expected', () => {
    const inputData = '<table class="e-table"><tbody><tr><td>foo</td></tr></tbody></table>'
    const expectedOutput = '<table class="e-table"><tbody><tr><td>foo</td></tr></tbody></table>'
    const result = renderGradingInstruction(inputData)
    const table = result.container.querySelector('.ProseMirror')
    expect(table!.innerHTML).toBe(expectedOutput)
  })

  it('Change in table is returned as expected', async () => {
    cleanup = mockCreateRange()
    const inputData = '<table class="e-table"><tbody><tr><td>foo</td></tr></tbody></table>'
    const expectedOutput = '<table class="e-table"><tbody><tr><td>bar</td></tr></tbody></table>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await act(async () => {
      insertText(await result.findByText('foo'), 'bar')
    })
    expect(onContentChangeMock).toHaveBeenCalledTimes(1)
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('Insert table adds expected table', async () => {
    const inputData = ''
    const expectedOutput =
      '<table class="e-table e-width-half"><tbody><tr><td></td><td></td></tr><tr><td></td><td></td></tr></tbody></table>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await act(async () => {
      await userEvent.click(await result.findByTestId('editor-menu-add-table'))
    })
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('Remove table removes table', async () => {
    const inputData = '<table><tbody><tr><td>foo</td></tr></tbody></table>'
    const expectedOutput = '<p></p>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await clickTableMenuButtonWithFocusOnCell(result, 'foo', 'Poista taulukko')
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('Insert column adds column', async () => {
    const inputData = '<table><tbody><tr><td>foo</td></tr></tbody></table>'
    const expectedOutput = '<table><tbody><tr><td>foo</td><td></td></tr></tbody></table>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await clickTableMenuButtonWithFocusOnCell(result, 'foo', 'Lisää sarake')
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('Remove column removes column', async () => {
    const inputData = '<table><tbody><tr><td>foo</td><td>bar</td></tr></tbody></table>'
    const expectedOutput = '<table><tbody><tr><td>bar</td></tr></tbody></table>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await clickTableMenuButtonWithFocusOnCell(result, 'foo', 'Poista sarake')
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('Insert row adds row', async () => {
    const inputData = '<table><tbody><tr><td>foo</td></tr></tbody></table>'
    const expectedOutput = '<table><tbody><tr><td>foo</td></tr><tr><td></td></tr></tbody></table>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await clickTableMenuButtonWithFocusOnCell(result, 'foo', 'Lisää rivi')
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('Remove row removes row', async () => {
    const inputData = '<table><tbody><tr><td>foo</td></tr><tr><td>bar</td></tr></tbody></table>'
    const expectedOutput = '<table><tbody><tr><td>bar</td></tr></tbody></table>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await clickTableMenuButtonWithFocusOnCell(result, 'foo', 'Poista rivi')
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('Full width changes full width class to table', async () => {
    const inputData = '<table class="e-width-half"><tbody><tr><td>foo</td></tr></tbody></table>'
    const expectedOutput = '<table class="e-width-full"><tbody><tr><td>foo</td></tr></tbody></table>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    expect(result.queryByText('Puolikas leveys')).not.toBeInTheDocument()
    await clickTableMenuButtonWithFocusOnCell(result, 'foo', 'Täysi leveys')
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('Half width changes half width class to table', async () => {
    const inputData = '<table class="e-width-full"><tbody><tr><td>foo</td></tr></tbody></table>'
    const expectedOutput = '<table class="e-width-half"><tbody><tr><td>foo</td></tr></tbody></table>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    expect(result.queryByText('Täysi leveys')).not.toBeInTheDocument()
    await clickTableMenuButtonWithFocusOnCell(result, 'foo', 'Puolikas leveys')
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('Remove borders adds e-table--borderless class to table', async () => {
    const inputData = '<table><tbody><tr><td>foo</td></tr></tbody></table>'
    const expectedOutput = '<table class="e-table--borderless"><tbody><tr><td>foo</td></tr></tbody></table>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    expect(result.queryByText('Lisää reunat')).not.toBeInTheDocument()
    await clickTableMenuButtonWithFocusOnCell(result, 'foo', 'Poista reunat')
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('Add borders removes e-table--borderless class from table', async () => {
    const inputData = '<table class="e-table--borderless"><tbody><tr><td>foo</td></tr></tbody></table>'
    const expectedOutput = '<table><tbody><tr><td>foo</td></tr></tbody></table>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    expect(result.queryByText('Poista reunat')).not.toBeInTheDocument()
    await clickTableMenuButtonWithFocusOnCell(result, 'foo', 'Lisää reunat')
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('Remove zebra removes class from table', async () => {
    const inputData = '<table class="e-table--zebra"><tbody><tr><td>foo</td></tr></tbody></table>'
    const expectedOutput = '<table><tbody><tr><td>foo</td></tr></tbody></table>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    expect(result.queryByText('Lisää raidat')).not.toBeInTheDocument()
    await clickTableMenuButtonWithFocusOnCell(result, 'foo', 'Poista raidat')
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('Add zebra adds e-table--zebra class to table', async () => {
    const inputData = '<table><tbody><tr><td>foo</td></tr></tbody></table>'
    const expectedOutput = '<table class="e-table--zebra"><tbody><tr><td>foo</td></tr></tbody></table>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    expect(result.queryByText('Poista raidat')).not.toBeInTheDocument()
    await clickTableMenuButtonWithFocusOnCell(result, 'foo', 'Lisää raidat')
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })
})

async function clickTableMenuButtonWithFocusOnCell(result: RenderResult, cellText: string, buttonText: string) {
  await act(async () => {
    await focusOnTablesCell(result, cellText)
    await userEvent.click(await result.findByText(buttonText))
  })
}

async function focusOnTablesCell(result: RenderResult, text: string) {
  // Replace cell's text with same text
  // Hack to get focus on cell without need to mock createRange
  insertText(await result.findByText(text), text)
}

function mockCreateRange() {
  const originalCreateRange = global.window.document.createRange
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  global.Range = function Range() {}

  const createContextualFragment = (html: string) => {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.children[0]
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  Range.prototype.createContextualFragment = (html: string) => createContextualFragment(html)

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  global.window.document.createRange = function createRange() {
    return {
      setEnd: () => {},
      setStart: () => {},
      getBoundingClientRect: () => ({ right: 0 }),
      getClientRects: () => [],
      createContextualFragment
    }
  }
  return () => (global.window.document.createRange = originalCreateRange)
}
