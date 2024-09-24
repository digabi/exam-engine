import '@testing-library/jest-dom'
import { cleanup, act as testAct, fireEvent } from '@testing-library/react'
import { mockCreateRange, promisifiedFireEvent } from '../utils/prosemirror'
import { renderGradingInstruction } from '../utils/renderEditableGradingInstruction'

const act = testAct as (func: () => Promise<void>) => Promise<void>

describe('ImageUploadButton', () => {
  let onContentChangeMock: jest.Mock

  beforeEach(() => {
    onContentChangeMock = jest.fn()
  })

  beforeAll(() => {
    mockCreateRange()
  })

  afterEach(() => {
    cleanup()
  })

  describe('Renders Image', () => {
    it('e:image tags are rendered in and rendered out with correct attributes and tags', async () => {
      const { getByRole, getByText } = renderGradingInstruction(
        '<div><p>hello</p><e:image data-editor-id="e-image" width="954" alt="foo" src="foo.bar"></e:image></div>',
        onContentChangeMock
      )
      const image = getByRole('img', { name: 'foo' })
      const text = getByText('hello')
      expect(image).toHaveAttribute('src', 'foo.bar')
      expect(image).toHaveAttribute('width', '954')
      await act(
        async () =>
          await promisifiedFireEvent(() => fireEvent.input(text, { target: { innerText: 'text', innerHTML: 'text' } }))
      )

      expect(onContentChangeMock).toHaveBeenCalledTimes(1)
      expect(onContentChangeMock).toHaveBeenCalledWith('<p>text</p><p><e:image src="foo.bar"></e:image></p>', '')
    })

    it.skip('image can be uploaded', () => {})
  })
})
