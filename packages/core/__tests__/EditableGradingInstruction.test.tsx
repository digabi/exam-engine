import React from 'react'
import { fireEvent, render, act as testAct, RenderResult } from '@testing-library/react'
import EditableGradingInstruction from '../src/components/grading-instructions/EditableGradingInstruction'
import { GradingInstructionProvider } from '../src/components/grading-instructions/GradingInstructionProvider'
import userEvent from '@testing-library/user-event'

const act = testAct as (func: () => Promise<void>) => Promise<void>

describe('EditableGradingInstruction', () => {
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

  describe('table', () => {
    it('Table is rendered as expected', () => {
      const inputData = '<table class="e-table"><tr><td>foo</td></tr></table>'
      const expectedOutput = '<table class="e-table"><tbody><tr><td><p>foo</p></td></tr></tbody></table>'
      const result = renderGradinginstruction(inputData)
      const table = result.container.querySelector('.ProseMirror')
      expect(table!.innerHTML).toBe(expectedOutput)
    })

    it('Change in table is returned as expected', async () => {
      cleanup = mockCreateRange()
      const inputData = '<table class="e-table"><tr><td>foo</td></tr></table>'
      const expectedOutput = '<table class="e-table"><tbody><tr><td><p>bar</p></td></tr></tbody></table>'
      const result = renderGradinginstruction(inputData, onContentChangeMock)
      await act(async () => {
        insertText(await result.findByText('foo'), 'bar')
      })
      expect(onContentChangeMock).toHaveBeenCalledTimes(1)
      expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
    })

    it('Insert table adds expected table', async () => {
      const inputData = ''
      const expectedOutput =
        '<table class="e-table e-width-half"><tbody><tr><td><p></p></td><td><p></p></td></tr><tr><td><p></p></td><td><p></p></td></tr></tbody></table>'
      const result = renderGradinginstruction(inputData, onContentChangeMock)
      await act(async () => {
        await userEvent.click(await result.findByText('Lisää taulukko'))
      })
      expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
    })

    it('Remove table removes table', async () => {
      const inputData = '<table><tr><td>foo</td></tr></table>'
      const expectedOutput = '<p></p>'
      const result = renderGradinginstruction(inputData, onContentChangeMock)
      await clickTableMenuButtonWithFocusOnCell(result, 'foo', 'Poista taulukko')
      expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
    })

    it('Insert column adds column', async () => {
      const inputData = '<table><tr><td>foo</td></tr></table>'
      const expectedOutput = '<table><tbody><tr><td><p>foo</p></td><td><p></p></td></tr></tbody></table>'
      const result = renderGradinginstruction(inputData, onContentChangeMock)
      await clickTableMenuButtonWithFocusOnCell(result, 'foo', 'Lisää sarake')
      expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
    })

    it('Remove column removes column', async () => {
      const inputData = '<table><tr><td>foo</td><td>bar</td></tr></table>'
      const expectedOutput = '<table><tbody><tr><td><p>bar</p></td></tr></tbody></table>'
      const result = renderGradinginstruction(inputData, onContentChangeMock)
      await clickTableMenuButtonWithFocusOnCell(result, 'foo', 'Poista sarake')
      expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
    })

    it('Insert row adds row', async () => {
      const inputData = '<table><tr><td>foo</td></tr></table>'
      const expectedOutput = '<table><tbody><tr><td><p>foo</p></td></tr><tr><td><p></p></td></tr></tbody></table>'
      const result = renderGradinginstruction(inputData, onContentChangeMock)
      await clickTableMenuButtonWithFocusOnCell(result, 'foo', 'Lisää rivi')
      expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
    })

    it('Remove row removes row', async () => {
      const inputData = '<table><tr><td>foo</td></tr><tr><td>bar</td></tr></table>'
      const expectedOutput = '<table><tbody><tr><td><p>bar</p></td></tr></tbody></table>'
      const result = renderGradinginstruction(inputData, onContentChangeMock)
      await clickTableMenuButtonWithFocusOnCell(result, 'foo', 'Poista rivi')
      expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
    })

    it('Full width changes full width class to table', async () => {
      const inputData = '<table class="e-width-half"><tr><td>foo</td></tr></table>'
      const expectedOutput = '<table class="e-width-full"><tbody><tr><td><p>foo</p></td></tr></tbody></table>'
      const result = renderGradinginstruction(inputData, onContentChangeMock)
      await clickTableMenuButtonWithFocusOnCell(result, 'foo', 'Täysi leveys')
      expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
    })

    it('Half width changes half width class to table', async () => {
      const inputData = '<table class="e-width-full"><tr><td>foo</td></tr></table>'
      const expectedOutput = '<table class="e-width-half"><tbody><tr><td><p>foo</p></td></tr></tbody></table>'
      const result = renderGradinginstruction(inputData, onContentChangeMock)
      await clickTableMenuButtonWithFocusOnCell(result, 'foo', 'Puolikas leveys')
      expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
    })

    it('Remove borders adds e-table--borderless class to table', async () => {
      const inputData = '<table><tr><td>foo</td></tr></table>'
      const expectedOutput = '<table class="e-table--borderless"><tbody><tr><td><p>foo</p></td></tr></tbody></table>'
      const result = renderGradinginstruction(inputData, onContentChangeMock)
      await clickTableMenuButtonWithFocusOnCell(result, 'foo', 'Poista reunat')
      expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
    })

    it('Add borders removes e-table--borderless class from table', async () => {
      const inputData = '<table class="e-table--borderless"><tr><td>foo</td></tr></table>'
      const expectedOutput = '<table><tbody><tr><td><p>foo</p></td></tr></tbody></table>'
      const result = renderGradinginstruction(inputData, onContentChangeMock)
      await clickTableMenuButtonWithFocusOnCell(result, 'foo', 'Lisää reunat')
      expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
    })

    it('Remove zebra removes class from table', async () => {
      const inputData = '<table class="e-table--zebra"><tr><td>foo</td></tr></table>'
      const expectedOutput = '<table><tbody><tr><td><p>foo</p></td></tr></tbody></table>'
      const result = renderGradinginstruction(inputData, onContentChangeMock)
      await clickTableMenuButtonWithFocusOnCell(result, 'foo', 'Poista kuviointi')
      expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
    })

    it('Add zebra adds e-table--zebra class to table', async () => {
      const inputData = '<table><tr><td>foo</td></tr></table>'
      const expectedOutput = '<table class="e-table--zebra"><tbody><tr><td><p>foo</p></td></tr></tbody></table>'
      const result = renderGradinginstruction(inputData, onContentChangeMock)
      await clickTableMenuButtonWithFocusOnCell(result, 'foo', 'Lisää kuviointi')
      expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
    })
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
