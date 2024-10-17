import { PreviewContext, previewExam } from '@digabi/exam-engine-rendering'
import { Page } from 'puppeteer'
import { getInnerHtml, initPuppeteer } from './puppeteerUtils'

const langs = ['fi-FI', 'sv-FI']
const examTypes = ['hearing-impaired', 'visually-impaired']

describe('testEditableGradingInstructionLocalization.ts — Grading instruction localize mastering', () => {
  const createPage = initPuppeteer()
  let page: Page
  let ctx: PreviewContext
  let origEditableGradingInstructions: string | undefined = undefined

  beforeAll(async () => {
    origEditableGradingInstructions = process.env.EDITABLE_GRADING_INSTRUCTIONS
    process.env.EDITABLE_GRADING_INSTRUCTIONS = 'true'
    ctx = await previewExam(`${__dirname}/fixtures/XX/koe.xml`, {
      editableGradingInstructions: true
    })
    page = await createPage()
  })

  afterAll(async () => {
    process.env.EDITABLE_GRADING_INSTRUCTIONS = origEditableGradingInstructions
    await ctx.close()
  })

  it('renders exam grading instructions as read-only (removing unnecessary localizations), exam grading instructions are not editable', async () => {
    await page.goto(`${ctx.url}/fi-FI/normal/grading-instructions`)
    await page.waitForSelector('.e-exam-grading-instruction')
    const valueFi = await getInnerHtml(page, '.e-exam-grading-instruction')
    expect(valueFi.replace(/\n\s+/g, ' ')).toContain(
      ` Normaali tekstikappale <br> <span>Lokalisaatio: Ei attribuutteja <br> </span> <span lang="fi-FI">Lokalisaatio: FI only <br> </span> `
    )
    await page.goto(`${ctx.url}/sv-FI/visually-impaired/grading-instructions`)
    await page.waitForSelector('.e-exam-grading-instruction')
    const valueSv = await getInnerHtml(page, '.e-exam-grading-instruction')
    expect(valueSv.replace(/\n\s+/g, ' ')).toContain(
      ` Normaali tekstikappale <br> <span>Lokalisaatio: Ei attribuutteja <br> </span> <span lang="sv-FI">Lokalisaatio: SV only <br> </span> <span lang="sv-FI">Lokalisaatio: SV NV <br> </span> <span>Lokalisaatio: NV only <br> </span> `
    )
  })

  it('renders all grading instructions regardless the localization (language or exam type)', async () => {
    const valueFi = await getContent(page, `${ctx.url}/fi-FI/visually-impaired/grading-instructions`)
    expect(valueFi)
      .toContain(`<div><e:answer-grading-instruction path="/e:exam/e:section/e:question/e:text-answer/e:answer-grading-instruction">
                    Normaali tekstikappale
                    <div data-editor-id="e-localization-block">Lokalisaatio: Ei attribuutteja</div>
                    <div lang="fi-FI" data-editor-id="e-localization-block">Lokalisaatio: FI only
                        <br>
                        <span exam-type="hearing-impaired" lang="fi-FI" data-editor-id="e-localization-inline" hidden="hidden">Lokalisaatio: FI KV (supports localization nesting)
                            <br>
                        </span>
                    </div>
                    <div lang="fi-FI" exam-type="visually-impaired" data-editor-id="e-localization-block">Lokalisaatio: FI NV
                    </div>
                    <div lang="fi-FI" exam-type="visually-impaired" data-editor-id="e-localization-block">Lokalisaatio: FI NV
                    </div>
                    <div lang="sv-FI" data-editor-id="e-localization-block" hidden="hidden">
                        <p>Lokalisaatio: SV only</p>
                    </div>
                    <div lang="sv-FI" exam-type="hearing-impaired" data-editor-id="e-localization-block" hidden="hidden">Lokalisaatio: SV KV
                    </div>
                    <div lang="sv-FI" exam-type="visually-impaired" data-editor-id="e-localization-block" hidden="hidden">Lokalisaatio: SV NV
                    </div>
                    <div exam-type="hearing-impaired" data-editor-id="e-localization-block" hidden="hidden">Lokalisaatio: KV only
                    </div>
                    <div exam-type="visually-impaired" data-editor-id="e-localization-block">Lokalisaatio: NV only
                    </div>
                    <div lang="sv-FI" data-editor-id="e-localization-block" hidden="hidden">
                        <table><tbody><tr><td>Testitaulukko</td></tr></tbody></table>
                    </div>
                </e:answer-grading-instruction></div>`)

    const valueSv = await getContent(page, `${ctx.url}/sv-FI/hearing-impaired/grading-instructions`)
    expect(valueSv).toContain(
      `<div><e:answer-grading-instruction path="/e:exam/e:section/e:question/e:text-answer/e:answer-grading-instruction">
                    Normaali tekstikappale
                    <div data-editor-id="e-localization-block">Lokalisaatio: Ei attribuutteja</div>
                    <div lang="fi-FI" data-editor-id="e-localization-block" hidden="hidden">Lokalisaatio: FI only
                        <br>
                        <span exam-type="hearing-impaired" lang="fi-FI" data-editor-id="e-localization-inline" hidden="hidden">Lokalisaatio: FI KV (supports localization nesting)
                            <br>
                        </span>
                    </div>
                    <div lang="fi-FI" exam-type="visually-impaired" data-editor-id="e-localization-block" hidden="hidden">Lokalisaatio: FI NV
                    </div>
                    <div lang="fi-FI" exam-type="visually-impaired" data-editor-id="e-localization-block" hidden="hidden">Lokalisaatio: FI NV
                    </div>
                    <div lang="sv-FI" data-editor-id="e-localization-block">
                        <p>Lokalisaatio: SV only</p>
                    </div>
                    <div lang="sv-FI" exam-type="hearing-impaired" data-editor-id="e-localization-block">Lokalisaatio: SV KV
                    </div>
                    <div lang="sv-FI" exam-type="visually-impaired" data-editor-id="e-localization-block" hidden="hidden">Lokalisaatio: SV NV
                    </div>
                    <div exam-type="hearing-impaired" data-editor-id="e-localization-block">Lokalisaatio: KV only
                    </div>
                    <div exam-type="visually-impaired" data-editor-id="e-localization-block" hidden="hidden">Lokalisaatio: NV only
                    </div>
                    <div lang="sv-FI" data-editor-id="e-localization-block">
                        <table><tbody><tr><td>Testitaulukko</td></tr></tbody></table>
                    </div>
                </e:answer-grading-instruction></div>`
    )
  })

  it('hides grading instruction localizations not belonging to the opened page', async () => {
    const value = await getContent(page, `${ctx.url}/fi-FI/normal/grading-instructions`)
    expect(value).toContain(
      '<span exam-type="hearing-impaired" lang="fi-FI" data-editor-id="e-localization-inline" hidden="hidden">'
    )
    expect(value).toContain(
      '<div lang="sv-FI" exam-type="visually-impaired" data-editor-id="e-localization-block" hidden="hidden">'
    )
    expect(value).toContain('<div lang="sv-FI" data-editor-id="e-localization-block" hidden="hidden">')
    expect(value).toContain(
      '<div lang="sv-FI" exam-type="hearing-impaired" data-editor-id="e-localization-block" hidden="hidden">'
    )
    expect(value).toContain(
      '<div lang="sv-FI" exam-type="visually-impaired" data-editor-id="e-localization-block" hidden="hidden">'
    )
  })

  it('grading instruction without localization is shown on all pages', async () => {
    for (const lang of langs) {
      for (const examType of examTypes) {
        const value = await getContent(page, `${ctx.url}/${lang}/${examType}/grading-instructions`)
        expect(value).toContain('Normaali tekstikappale')
      }
    }
  })

  it('grading instruction localization without any attributes is shown on all pages', async () => {
    for (const lang of langs) {
      for (const examType of examTypes) {
        const value = await getContent(page, `${ctx.url}/${lang}/${examType}/grading-instructions`)
        expect(value).toContain('Lokalisaatio: Ei attribuutteja')
      }
    }
  })

  it('grading instruction localization with language attribute shows instruction all pages to that language, regardless the exam type', async () => {
    for (const examType of examTypes) {
      const valueFi = await getContent(page, `${ctx.url}/fi-FI/${examType}/grading-instructions`)
      expect(valueFi).toContain('Lokalisaatio: FI only')

      const valueSv = await getContent(page, `${ctx.url}/sv-FI/${examType}/grading-instructions`)
      expect(valueSv).toContain('Lokalisaatio: SV only')
    }
  })

  it('grading instruction with exam type attribute shows instruction all pages to that exam type, regardless the language', async () => {
    for (const lang of langs) {
      const valueHi = await getContent(page, `${ctx.url}/${lang}/hearing-impaired/grading-instructions`)
      expect(valueHi).toContain('Lokalisaatio: KV only')

      const valueVi = await getContent(page, `${ctx.url}/${lang}/visually-impaired/grading-instructions`)
      expect(valueVi).toContain('Lokalisaatio: NV only')
    }
  })

  it('support multiple question grading instructions on the same question', async () => {
    const values = await getContent(page, `${ctx.url}/fi-FI/normal/grading-instructions`, [
      '.e-grading-instructions-question .e-answer-grading-instruction',
      '.e-grading-instructions-question .e-answer-grading-instruction ~ .e-answer-grading-instruction',
      '.e-grading-instructions-question .e-answer-grading-instruction ~ .e-answer-grading-instruction ~ .e-answer-grading-instruction'
    ])
    expect(values).toEqual([
      '<div><e:question-grading-instruction path="/e:exam/e:section/e:question/e:question-grading-instruction[1]">1</e:question-grading-instruction></div>',
      '<div><e:question-grading-instruction path="/e:exam/e:section/e:question/e:question-grading-instruction[2]">2</e:question-grading-instruction></div>',
      '<div><e:question-grading-instruction path="/e:exam/e:section/e:question/e:question-grading-instruction[3]">3</e:question-grading-instruction></div>'
    ])
  })

  async function getContent(
    page: Page,
    url: string,
    selectors: string[] = ['.e-answer-grading-instruction:last-of-type']
  ) {
    await page.goto(url)
    await page.waitForSelector('.e-answer-grading-instruction')
    if (selectors.length == 1) {
      return getInnerHtml(page, `${selectors[0]}`)
    }
    return Promise.all(selectors.map(selector => getInnerHtml(page, `${selector}`)))
  }
})
