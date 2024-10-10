import React from 'react'
import '@testing-library/jest-dom'
import { render, cleanup, act as testAct, within } from '@testing-library/react'
import ProseMirrorWrapper from '../utils/ProseMirrorWrapper'
import { mockCreateRange } from '../utils/prosemirror'
import FormatButton from '../../src/components/grading-instructions/editor/FormatButton'
import userEvent from '@testing-library/user-event'
import { insertText } from '../utils/util'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faBold, faItalic } from '@fortawesome/free-solid-svg-icons'

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
      const props = { markName: 'em', icon: faItalic }
      const { button } = renderEditorWithFormatButton(props)
      expect(button.children[0]).toHaveAttribute('data-icon', 'italic')
    })

    it('Toggles button active state when clicked', async () => {
      const props = { markName: 'em', icon: faItalic }
      const { button } = renderEditorWithFormatButton(props)

      expect(button).not.toHaveClass('active')

      await userEvent.click(button)
      expect(button).toHaveClass('active')

      await userEvent.click(button)
      expect(button).not.toHaveClass('active')
    })

    it('formats text', async () => {
      const props = { markName: 'em', icon: faItalic }
      const { button, paragraph, container } = renderEditorWithFormatButton(props)

      await userEvent.click(button)
      await act(async () => insertText(await container.findByRole('paragraph'), 'hello'))
      expect(within(paragraph).getByRole('emphasis')).toHaveTextContent('hello')
    })

    it('em tags are rendered as italic', () => {
      const props = { markName: 'em', icon: faItalic, innerHtml: '<em>Italic text</em>' }
      const { paragraph } = renderEditorWithFormatButton(props)
      expect(within(paragraph).getByRole('emphasis')).toHaveTextContent('Italic text')
    })

    it('i tags are rendered as italic', () => {
      const props = { markName: 'em', icon: faItalic, innerHtml: '<i>Italic text</i>' }
      const { paragraph } = renderEditorWithFormatButton(props)
      expect(within(paragraph).getByRole('emphasis')).toHaveTextContent('Italic text')
    })
  })

  describe('Bold', () => {
    it('Renders bold button', () => {
      const props = { markName: 'strong', icon: faBold }
      const { button } = renderEditorWithFormatButton(props)
      expect(button.children[0]).toHaveAttribute('data-icon', 'bold')
    })

    it('Toggles button active state when clicked', async () => {
      const props = { markName: 'strong', icon: faBold }
      const { button } = renderEditorWithFormatButton(props)

      expect(button).not.toHaveClass('active')

      await userEvent.click(button)
      expect(button).toHaveClass('active')

      await userEvent.click(button)
      expect(button).not.toHaveClass('active')
    })

    it('formats text', async () => {
      const props = { markName: 'strong', icon: faBold }

      const { button, container, paragraph } = renderEditorWithFormatButton(props)

      await userEvent.click(button)
      await act(async () => {
        insertText(await container.findByRole('paragraph'), 'hello')
      })
      expect(within(paragraph).getByRole('strong')).toHaveTextContent('hello')
    })

    it('b tags are rendered as bold', () => {
      const props = { markName: 'strong', icon: faBold, innerHtml: '<b>Bold text</b>' }
      const { paragraph } = renderEditorWithFormatButton(props)
      expect(within(paragraph).getByRole('strong')).toHaveTextContent('Bold text')
    })

    it('strong tags are rendered as bold', () => {
      const props = { markName: 'strong', icon: faBold, innerHtml: '<strong>Bold text</strong>' }
      const { paragraph } = renderEditorWithFormatButton(props)
      expect(within(paragraph).getByRole('strong')).toHaveTextContent('Bold text')
    })
  })

  function renderEditorWithFormatButton(props: { markName: string; icon: IconDefinition; innerHtml?: string }) {
    const { markName, icon, innerHtml = '' } = props
    const container = render(
      <ProseMirrorWrapper innerHtml={innerHtml}>
        <FormatButton markName={markName} icon={icon} />
      </ProseMirrorWrapper>
    )
    return { button: container.getByRole('button'), paragraph: container.getByRole('paragraph'), container }
  }
})
