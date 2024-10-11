import { PreviewContext, previewExam } from '@digabi/exam-engine-rendering'
import { Page } from 'puppeteer'
import { getInnerHtml, initPuppeteer } from './puppeteerUtils'

const langs = ['fi-FI', 'sv-FI']
const examTypes = ['hearing-impaired', 'visually-impaired']

describe('testEditableGradingInstructionLocalization.ts — Grading instruction localize editing', () => {
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
    const valueFi = await getProseMirrorContent(page, `${ctx.url}/fi-FI/visually-impaired/grading-instructions`)
    expect(valueFi).toContain(
      '<p>Normaali tekstikappale <br> <span>Lokalisaatio: Ei attribuutteja <br></span> <span lang="fi-FI">Lokalisaatio: FI only <br> <span lang="fi-FI" exam-type="hearing-impaired" hidden="hidden">Lokalisaatio: FI KV (supports localization nesting) <br></span></span> <span lang="fi-FI" exam-type="visually-impaired">Lokalisaatio: FI NV <br></span> <span lang="fi-FI" exam-type="visually-impaired">Lokalisaatio: FI NV <br></span><br class="ProseMirror-trailingBreak"></p><div lang="sv-FI" hidden="hidden"><p>Lokalisaatio: SV only</p></div><p><span lang="sv-FI" exam-type="hearing-impaired" hidden="hidden">Lokalisaatio: SV KV <br></span> <span lang="sv-FI" exam-type="visually-impaired" hidden="hidden">Lokalisaatio: SV NV <br></span> <span exam-type="hearing-impaired" hidden="hidden">Lokalisaatio: KV only <br></span> <span exam-type="visually-impaired">Lokalisaatio: NV only <br></span><br class="ProseMirror-trailingBreak"></p><div lang="sv-FI" hidden="hidden"><table><tbody><tr><td>Testitaulukko</td></tr></tbody></table></div>'
    )

    const valueSv = await getProseMirrorContent(page, `${ctx.url}/sv-FI/hearing-impaired/grading-instructions`)
    expect(valueSv).toContain(
      '<p>Normaali tekstikappale <br> <span>Lokalisaatio: Ei attribuutteja <br></span> <span lang="fi-FI" hidden="hidden">Lokalisaatio: FI only <br> <span lang="fi-FI" exam-type="hearing-impaired" hidden="hidden">Lokalisaatio: FI KV (supports localization nesting) <br></span></span> <span lang="fi-FI" exam-type="visually-impaired" hidden="hidden">Lokalisaatio: FI NV <br></span> <span lang="fi-FI" exam-type="visually-impaired" hidden="hidden">Lokalisaatio: FI NV <br></span><br class="ProseMirror-trailingBreak"></p><div lang="sv-FI"><p>Lokalisaatio: SV only</p></div><p><span lang="sv-FI" exam-type="hearing-impaired">Lokalisaatio: SV KV <br></span> <span lang="sv-FI" exam-type="visually-impaired" hidden="hidden">Lokalisaatio: SV NV <br></span> <span exam-type="hearing-impaired">Lokalisaatio: KV only <br></span> <span exam-type="visually-impaired" hidden="hidden">Lokalisaatio: NV only <br></span><br class="ProseMirror-trailingBreak"></p><div lang="sv-FI"><table><tbody><tr><td>Testitaulukko</td></tr></tbody></table></div>'
    )
  })

  it('hides grading instruction localizations not belonging to the opened page', async () => {
    const value = await getProseMirrorContent(page, `${ctx.url}/fi-FI/normal/grading-instructions`)
    expect(value).toContain('<span lang="fi-FI" exam-type="hearing-impaired" hidden="hidden">')
    expect(value).toContain('<span lang="fi-FI" exam-type="visually-impaired" hidden="hidden">')
    expect(value).toContain('<div lang="sv-FI" hidden="hidden">')
    expect(value).toContain('<span lang="sv-FI" exam-type="hearing-impaired" hidden="hidden">')
    expect(value).toContain('<span lang="sv-FI" exam-type="visually-impaired" hidden="hidden">')
  })

  it('grading instruction without localization is shown on all pages', async () => {
    for (const lang of langs) {
      for (const examType of examTypes) {
        const value = await getProseMirrorContent(page, `${ctx.url}/${lang}/${examType}/grading-instructions`)
        expect(value).toContain('Normaali tekstikappale')
      }
    }
  })

  it('grading instruction localization without any attributes is shown on all pages', async () => {
    for (const lang of langs) {
      for (const examType of examTypes) {
        const value = await getProseMirrorContent(page, `${ctx.url}/${lang}/${examType}/grading-instructions`)
        expect(value).toContain('Lokalisaatio: Ei attribuutteja')
      }
    }
  })

  it('grading instruction localization with language attribute shows instruction all pages to that language, regardless the exam type', async () => {
    for (const examType of examTypes) {
      const valueFi = await getProseMirrorContent(page, `${ctx.url}/fi-FI/${examType}/grading-instructions`)
      expect(valueFi).toContain('Lokalisaatio: FI only')

      const valueSv = await getProseMirrorContent(page, `${ctx.url}/sv-FI/${examType}/grading-instructions`)
      expect(valueSv).toContain('Lokalisaatio: SV only')
    }
  })

  it('grading instruction with exam type attribute shows instruction all pages to that exam type, regardless the language', async () => {
    for (const lang of langs) {
      const valueHi = await getProseMirrorContent(page, `${ctx.url}/${lang}/hearing-impaired/grading-instructions`)
      expect(valueHi).toContain('Lokalisaatio: KV only')

      const valueVi = await getProseMirrorContent(page, `${ctx.url}/${lang}/visually-impaired/grading-instructions`)
      expect(valueVi).toContain('Lokalisaatio: NV only')
    }
  })

  it('support multiple question grading instructions on the same question', async () => {
    const values = await getProseMirrorContent(page, `${ctx.url}/fi-FI/normal/grading-instructions`, [
      '.e-grading-instructions-question .e-answer-grading-instruction',
      '.e-grading-instructions-question .e-answer-grading-instruction ~ .e-answer-grading-instruction',
      '.e-grading-instructions-question .e-answer-grading-instruction ~ .e-answer-grading-instruction ~ .e-answer-grading-instruction'
    ])
    expect(values).toEqual(['<p>1</p>', '<p>2</p>', '<p>3</p>'])
  })

  async function getProseMirrorContent(
    page: Page,
    url: string,
    selectors: string[] = ['.e-answer-grading-instruction:last-of-type']
  ) {
    await page.goto(url)
    await page.waitForSelector('.e-answer-grading-instruction')
    if (selectors.length == 1) {
      return getInnerHtml(page, `${selectors[0]} .ProseMirror`)
    }
    return Promise.all(selectors.map(selector => getInnerHtml(page, `${selector} .ProseMirror`)))
  }
})
