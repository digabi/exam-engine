import React from 'react'
import '@testing-library/jest-dom'
import { render, cleanup, fireEvent, act as testAct } from '@testing-library/react'
import ProseMirrorWrapper from './utils/ProseMirrorWrapper'
import FormatButton from '../src/components/grading-instructions/editor/FormatButton'
import userEvent from '@testing-library/user-event'

const act = testAct as (func: () => Promise<void>) => Promise<void>

describe('FormatButton', () => {
  beforeAll(() => {
    mockCreateRange()
  })

  afterEach(() => {
    cleanup()
  })

  describe('Italics button', () => {
    it('Renders italics button', () => {
      const props = { markName: 'em', displayName: 'Italic' }
      const { getByRole } = render(
        <ProseMirrorWrapper>
          <FormatButton {...props} />
        </ProseMirrorWrapper>
      )
      const button = getByRole('button')
      expect(button).toHaveTextContent(props.displayName)
    })

    it('Toggles button active state when clicked', async () => {
      const props = { markName: 'em', displayName: 'Italic' }

      const { getByRole } = render(
        <ProseMirrorWrapper>
          <FormatButton {...props} />
        </ProseMirrorWrapper>
      )
      const button = getByRole('button')
      expect(button).toHaveStyle('font-weight: normal')

      await userEvent.click(button)
      expect(button).toHaveStyle('font-weight: bold')

      await userEvent.click(button)
      expect(button).toHaveStyle('font-weight: normal')
    })

    it('formats text', async () => {
      const props = { markName: 'em', displayName: 'Italic' }

      const { getByRole } = render(
        <ProseMirrorWrapper>
          <FormatButton {...props} />
        </ProseMirrorWrapper>
      )
      const button = getByRole('button')
      await userEvent.click(button)

      const paragraph = getByRole('paragraph')
      expect(paragraph).toBeInTheDocument()
      fireEvent.input(paragraph, { target: { innerHTML: 'hello' } })
      await act(async () => await promisifiedFireEventInput(paragraph, { target: { innerHTML: 'hello' } }))
      expect(getByRole('emphasis')).toHaveTextContent('hello')
    })
  })

  describe('Bold button', () => {
    it('Renders bold button', () => {
      const props = { markName: 'strong', displayName: 'Bold' }
      const { getByRole } = render(
        <ProseMirrorWrapper>
          <FormatButton {...props} />
        </ProseMirrorWrapper>
      )
      const button = getByRole('button')
      expect(button).toHaveTextContent('Bold')
    })

    it('formats text', async () => {
      const props = { markName: 'strong', displayName: 'Bold' }

      const { getByRole } = render(
        <ProseMirrorWrapper>
          <FormatButton {...props} />
        </ProseMirrorWrapper>
      )
      const button = getByRole('button')
      await userEvent.click(button)

      const paragraph = getByRole('paragraph')
      fireEvent.input(paragraph, { target: { innerHTML: 'hello' } })
      await act(async () => await promisifiedFireEventInput(paragraph, { target: { innerHTML: 'hello' } }))
      expect(getByRole('strong')).toHaveTextContent('hello')
    })
  })
})

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

function promisifiedFireEventInput(element: Element, options: object) {
  return new Promise<void>(resolve => {
    fireEvent.input(element, options)
    resolve()
  })
}
