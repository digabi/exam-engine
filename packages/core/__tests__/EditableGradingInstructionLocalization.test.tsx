import { act as testAct } from '@testing-library/react'
import { renderGradingInstruction } from './utils/renderEditableGradingInstruction'
import { insertText } from './utils/util'
import { mockCreateRange } from './utils/prosemirror'

const act = testAct as (func: () => Promise<void>) => Promise<void>

describe('EditableGradingInstructionLocalization', () => {
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

  it('preserves localization tags with data-editor-id attribute on save', async () => {
    // data-editor-id attribute is added on mastering exam
    const inputData =
      '<p><span lang="sv-FI" exam-type="hearing-impaired" data-editor-id="e-localization-inline">placeholder</span></p>'
    const expectedOutput =
      '<p><e:localization lang="sv-FI" exam-type="hearing-impaired">lokalisaatio</e:localization></p>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await act(async () => {
      insertText(await result.findByText('placeholder'), 'lokalisaatio')
    })
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('preserves nesting localization tags with data-editor-id attribute on save', async () => {
    const inputData =
      '<p><div lang="sv-FI" data-editor-id="e-localization-block"><p><span exam-type="hearing-impaired" data-editor-id="e-localization-inline">placeholder</span></p></div></p>'
    const expectedOutput =
      '<p></p><e:localization lang="sv-FI"><p><e:localization exam-type="hearing-impaired">lokalisaatio</e:localization></p></e:localization><p></p>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await act(async () => {
      insertText(await result.findByText('placeholder'), 'lokalisaatio')
    })
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('block localization preserves block elements (like <p>) on save', async () => {
    // data-editor-id attribute is added on mastering exam
    const inputData =
      '<div lang="sv-FI" exam-type="hearing-impaired" data-editor-id="e-localization-block"><p>placeholder</p></div>'
    const expectedOutput =
      '<e:localization lang="sv-FI" exam-type="hearing-impaired"><p>lokalisaatio</p></e:localization>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await act(async () => {
      insertText(await result.findByText('placeholder'), 'lokalisaatio')
    })
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('localization tags with wrong block type are ignored', async () => {
    const inputData =
      '<p><span lang="sv-FI" exam-type="hearing-impaired" data-editor-id="e-localization-block">placeholder</span></p>'
    const expectedOutput = '<p>lokalisaatio</p>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await act(async () => {
      insertText(await result.findByText('placeholder'), 'lokalisaatio')
    })
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('localization tags without data-editor attribute are ignored', async () => {
    const inputData = '<div lang="sv-FI" exam-type="hearing-impaired"><p>placeholder</p></div>'
    const expectedOutput = '<p>lokalisaatio</p>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await act(async () => {
      insertText(await result.findByText('placeholder'), 'lokalisaatio')
    })
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('localization tags without unknown data-editor attribute are ignored', async () => {
    const inputData = '<p><span lang="sv-FI" exam-type="hearing-impaired" data-editor-id="foo">placeholder</span></p>'
    const expectedOutput = '<p>lokalisaatio</p>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await act(async () => {
      insertText(await result.findByText('placeholder'), 'lokalisaatio')
    })
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it("removes localization's data-editor-id and hidden attributes on save", async () => {
    const inputData =
      '<p>Tämä <span exam-type="visually-impaired" data-editor-id="e-localization-inline" hidden="hidden">on</span> piilossa</p>'
    const expectedOutput = '<p>Tämä <e:localization exam-type="visually-impaired">ei ole</e:localization> piilossa</p>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await act(async () => {
      insertText(await result.findByText('on'), 'ei ole')
    })
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('saves all grading instructions as a whole regardless which localization is edited', async () => {
    const inputData = ` 
<p>Not localized</p>
<p>
<span data-editor-id="e-localization-inline">Localized without attributes</span>
<span data-editor-id="e-localization-inline" lang="fi-FI">Localized with language</span>
<span data-editor-id="e-localization-inline" exam-type="visually-impaired">Localized with exam-type</span>
<span data-editor-id="e-localization-inline" lang="sv-FI" exam-type="visually-impaired">Localized with language and exam-type</span>
</p>
`.replace(/\n/g, '')
    const expectedOutput = `
<p>Not localized</p>
<p>
<e:localization>Localized without attributes</e:localization>
<e:localization lang="fi-FI">Localized with language</e:localization>
<e:localization exam-type="visually-impaired">Localized with examType</e:localization>
<e:localization lang="sv-FI" exam-type="visually-impaired">Localized with language and exam-type</e:localization>
</p>
`.replace(/\n/g, '')
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await act(async () => {
      insertText(await result.findByText('Localized with exam-type'), 'Localized with examType')
    })
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })
})
