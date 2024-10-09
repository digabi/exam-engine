import '@testing-library/jest-dom'
import { cleanup, act as testAct, waitFor, within } from '@testing-library/react'
import { mockCreateRange } from '../utils/prosemirror'
import {
  renderGradingInstruction,
  mockedPermanentUrl,
  mockedResolvedPath
} from '../utils/renderEditableGradingInstruction'
import userEvent from '@testing-library/user-event'
import { insertText } from '../utils/util'
import { EditorView } from 'prosemirror-view'

jest.spyOn(EditorView.prototype, 'focus').mockImplementation(() => {})

const act = testAct as (func: () => Promise<void>) => Promise<void>

describe('ImageUploadButton', () => {
  let onContentChangeMock: jest.Mock
  const mockedTempUrl = 'mocked-temp-url'

  beforeEach(() => {
    onContentChangeMock = jest.fn()
  })

  beforeAll(() => {
    mockCreateRange()
    global.URL.createObjectURL = jest.fn(() => mockedTempUrl)
    File.prototype.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8))
  })

  afterEach(() => {
    cleanup()
  })

  describe('Renders Image', () => {
    const htmlAttrs = {
      width: '504',
      height: '504',
      class: 'foo',
      lang: 'fi-FI',
      src: `/${mockedResolvedPath}/foo.bar`
    }

    const xmlAttrs = {
      lang: htmlAttrs.lang,
      class: htmlAttrs.class,
      src: 'foo.bar'
    }

    it('e:image tag is rendered in and out with correct attributes and tags', async () => {
      const container = renderGradingInstruction(
        `<div><p>hello</p><e:image data-editor-id="e-image" width=${htmlAttrs.width} height=${htmlAttrs.height} lang=${htmlAttrs.lang} class=${htmlAttrs.class} src=${xmlAttrs.src}></e:image></div>`,
        onContentChangeMock
      )
      const image = container.getByRole('img')
      for (const [key, value] of Object.entries(htmlAttrs)) {
        expect(image).toHaveAttribute(key, value)
      }
      await act(async () => {
        insertText(await container.findByText('hello'), 'hello world')
      })

      expect(onContentChangeMock).toHaveBeenCalledTimes(1)
      expect(onContentChangeMock).toHaveBeenCalledWith(
        `<p>hello world</p><p><e:image lang="${xmlAttrs.lang}" class="${xmlAttrs.class}" src="${xmlAttrs.src}"></e:image></p>`,
        ''
      )
    })

    it('image can be uploaded', async () => {
      const container = renderGradingInstruction('', onContentChangeMock)
      const file = new File(['hello'], 'hello.png', { type: 'image/png' })
      const input = container.queryByTestId('image-upload-input')
      await userEvent.upload(input!, file)
      await waitFor(() => {
        expect(onContentChangeMock).toHaveBeenCalledTimes(2)
        expect(onContentChangeMock).toHaveBeenNthCalledWith(1, `<p><e:image src="${mockedTempUrl}"></e:image></p>`, '')
        expect(onContentChangeMock).toHaveBeenNthCalledWith(
          2,
          `<p><e:image src="${mockedPermanentUrl}"></e:image></p>`,
          ''
        )
        const image = container.getByRole('img')
        expect(image).toHaveAttribute('src', `/${mockedResolvedPath}/${mockedPermanentUrl}`)
      })
    })

    it('e:image-title tag is rendered in and out with correct attributes and tags', async () => {
      const imageTitle = { default: 'Image title text', fi: 'title fi', sv: 'title sv' }
      const container = renderGradingInstruction(
        `<div>
          <p>hello</p>
          <e:image data-editor-id="e-image" width=${htmlAttrs.width} height=${htmlAttrs.height} lang=${htmlAttrs.lang} class=${htmlAttrs.class} src=${xmlAttrs.src}>
            <e:image-title data-editor-id="e-image-title">
              ${imageTitle.default}
              <span lang="fi-FI" exam-type="hearing-impaired" data-editor-id="e-localization-inline">${imageTitle.fi}</span>
              <span lang="sv-FI" exam-type="hearing-impaired" data-editor-id="e-localization-inline">${imageTitle.sv}</span>
            </e:image-title>
          </e:image>
        </div>`,
        onContentChangeMock
      )
      const figure = container.getByRole('figure')
      for (const [key, value] of Object.entries(htmlAttrs)) {
        expect(within(figure).getByRole('img')).toHaveAttribute(key, value)
      }
      expect(figure.querySelector('figcaption')).toHaveTextContent(
        `${imageTitle.default} ${imageTitle.fi} ${imageTitle.sv}`
      )
      expect(figure.querySelector('figcaption [lang="fi-FI"]')).toHaveTextContent(imageTitle.fi)
      expect(figure.querySelector('figcaption [lang="sv-FI"]')).toHaveTextContent(imageTitle.sv)

      await act(async () => {
        insertText(await container.findByText('hello'), 'hello world')
      })

      expect(onContentChangeMock).toHaveBeenCalledTimes(1)
      expect(onContentChangeMock).toHaveBeenCalledWith(
        `<p>hello world</p><p><e:image lang="${xmlAttrs.lang}" class="${xmlAttrs.class}" src="${xmlAttrs.src}"><e:image-title>${imageTitle.default} <e:localization lang="fi-FI" exam-type="hearing-impaired">${imageTitle.fi}</e:localization> <e:localization lang="sv-FI" exam-type="hearing-impaired">${imageTitle.sv}</e:localization></e:image-title></e:image></p>`,
        ''
      )
    })
  })
})
