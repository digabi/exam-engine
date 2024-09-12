import React from 'react'
import '@testing-library/jest-dom'
import { render, cleanup, act as testAct, within } from '@testing-library/react'
import ProseMirrorWrapper from './utils/ProseMirrorWrapper'
import { mockCreateRange, promisifiedFireEventInput } from './utils/prosemirror'
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

  describe('Italics', () => {
    it('Renders italics button', () => {
      const props = { markName: 'em', displayName: 'Italic' }
      const { button } = renderEditorWithFormatButton(props)
      expect(button).toHaveTextContent(props.displayName)
    })

    it('Toggles button active state when clicked', async () => {
      const props = { markName: 'em', displayName: 'Italic' }
      const { button } = renderEditorWithFormatButton(props)

      expect(button).toHaveStyle('font-weight: normal')

      await userEvent.click(button)
      expect(button).toHaveStyle('font-weight: bold')

      await userEvent.click(button)
      expect(button).toHaveStyle('font-weight: normal')
    })

    it('formats text', async () => {
      const props = { markName: 'em', displayName: 'Italic' }
      const { button, paragraph } = renderEditorWithFormatButton(props)

      await userEvent.click(button)
      await act(async () => await promisifiedFireEventInput(paragraph, { target: { innerHTML: 'hello' } }))
      expect(within(paragraph).getByRole('emphasis')).toHaveTextContent('hello')
    })

    it('em tags are rendered as italic', () => {
      const props = { markName: 'em', displayName: 'Italic', innerHtml: '<em>Italic text</em>' }
      const { paragraph } = renderEditorWithFormatButton(props)
      expect(within(paragraph).getByRole('emphasis')).toHaveTextContent('Italic text')
    })

    it('i tags are rendered as italic', () => {
      const props = { markName: 'em', displayName: 'Italic', innerHtml: '<i>Italic text</i>' }
      const { paragraph } = renderEditorWithFormatButton(props)
      expect(within(paragraph).getByRole('emphasis')).toHaveTextContent('Italic text')
    })
  })

  describe('Bold', () => {
    it('Renders bold button', () => {
      const props = { markName: 'strong', displayName: 'Bold' }
      const { button } = renderEditorWithFormatButton(props)
      expect(button).toHaveTextContent(props.displayName)
    })

    it('Toggles button active state when clicked', async () => {
      const props = { markName: 'strong', displayName: 'Bold' }
      const { button } = renderEditorWithFormatButton(props)

      expect(button).toHaveStyle('font-weight: normal')

      await userEvent.click(button)
      expect(button).toHaveStyle('font-weight: bold')

      await userEvent.click(button)
      expect(button).toHaveStyle('font-weight: normal')
    })

    it('formats text', async () => {
      const props = { markName: 'strong', displayName: 'Bold' }

      const { button, paragraph } = renderEditorWithFormatButton(props)

      await userEvent.click(button)
      await act(async () => await promisifiedFireEventInput(paragraph, { target: { innerHTML: 'hello' } }))
      expect(within(paragraph).getByRole('strong')).toHaveTextContent('hello')
    })

    it('b tags are rendered as bold', () => {
      const props = { markName: 'strong', displayName: 'bold', innerHtml: '<b>Bold text</b>' }
      const { paragraph } = renderEditorWithFormatButton(props)
      expect(within(paragraph).getByRole('strong')).toHaveTextContent('Bold text')
    })

    it('strong tags are rendered as bold', () => {
      const props = { markName: 'strong', displayName: 'bold', innerHtml: '<strong>Bold text</strong>' }
      const { paragraph } = renderEditorWithFormatButton(props)
      expect(within(paragraph).getByRole('strong')).toHaveTextContent('Bold text')
    })
  })

  function renderEditorWithFormatButton(props: { markName: string; displayName: string; innerHtml?: string }) {
    const { markName, displayName, innerHtml = '' } = props
    const { getByRole } = render(
      <ProseMirrorWrapper innerHtml={innerHtml}>
        <FormatButton markName={markName} displayName={displayName} />
      </ProseMirrorWrapper>
    )
    return { button: getByRole('button'), paragraph: getByRole('paragraph') }
  }
})
