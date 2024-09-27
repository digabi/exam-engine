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

  it('preserves localization tags with e-localization attribute on save', async () => {
    // e-localization attribute is added on mastering exam
    const inputData =
      '<p><e:localization lang="sv-FI" exam-type="hearing-impaired" e-localization="1">placeholder</e:localization></p>'
    const expectedOutput =
      '<p><e:localization lang="sv-FI" exam-type="hearing-impaired">lokalisaatio</e:localization></p>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await act(async () => {
      insertText(await result.findByText('placeholder'), 'lokalisaatio')
    })
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it('localization tags without e-localization attribute are ignored', async () => {
    const inputData = '<p><e:localization lang="sv-FI" exam-type="hearing-impaired">placeholder</e:localization></p>'
    const expectedOutput = '<p>lokalisaatio</p>'
    const result = renderGradingInstruction(inputData, onContentChangeMock)
    await act(async () => {
      insertText(await result.findByText('placeholder'), 'lokalisaatio')
    })
    expect(onContentChangeMock).toHaveBeenCalledWith(expectedOutput, '')
  })

  it("removes localization's e-localization and hidden attributes on save", async () => {
    const inputData =
      '<p>Tämä <e:localization exam-type="visually-impaired" e-localization="1" hidden="hidden">on</e:localization> piilossa</p>'
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
<e:localization e-localization="1">Localized without attributes</e:localization>
<e:localization e-localization="1" lang="fi-FI">Localized with language</e:localization>
<e:localization e-localization="1" exam-type="visually-impaired">Localized with exam-type</e:localization>
<e:localization e-localization="1" lang="sv-FI" exam-type="visually-impaired">Localized with language and exam-type</e:localization>
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
