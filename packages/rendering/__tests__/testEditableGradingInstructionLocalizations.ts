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
      '<p>Normaali tekstikappale <br> <e:localization>Lokalisaatio: Ei attribuutteja <br> </e:localization><e:localization lang="fi-FI">Lokalisaatio: FI only <br> </e:localization><e:localization lang="fi-FI" exam-type="hearing-impaired" hidden="hidden">Lokalisaatio: FI KV (supports localization nesting) <br> </e:localization><e:localization lang="fi-FI" exam-type="visually-impaired">Lokalisaatio: FI NV <br> Lokalisaatio: FI NV <br> </e:localization><e:localization lang="sv-FI" hidden="hidden">Lokalisaatio: SV only <br> </e:localization><e:localization lang="sv-FI" exam-type="hearing-impaired" hidden="hidden">Lokalisaatio: SV KV <br> </e:localization><e:localization lang="sv-FI" exam-type="visually-impaired" hidden="hidden">Lokalisaatio: SV NV <br> </e:localization><e:localization exam-type="hearing-impaired" hidden="hidden">Lokalisaatio: KV only <br> </e:localization><e:localization exam-type="visually-impaired">Lokalisaatio: NV only <br></e:localization><br class="ProseMirror-trailingBreak"></p>'
    )

    const valueSv = await getProseMirrorContent(page, `${ctx.url}/sv-FI/hearing-impaired/grading-instructions`)
    expect(valueSv).toContain(
      '<p>Normaali tekstikappale <br> <e:localization>Lokalisaatio: Ei attribuutteja <br> </e:localization><e:localization lang="fi-FI" hidden="hidden">Lokalisaatio: FI only <br> </e:localization><e:localization lang="fi-FI" exam-type="hearing-impaired" hidden="hidden">Lokalisaatio: FI KV (supports localization nesting) <br> </e:localization><e:localization lang="fi-FI" exam-type="visually-impaired" hidden="hidden">Lokalisaatio: FI NV <br> Lokalisaatio: FI NV <br> </e:localization><e:localization lang="sv-FI">Lokalisaatio: SV only <br> </e:localization><e:localization lang="sv-FI" exam-type="hearing-impaired">Lokalisaatio: SV KV <br> </e:localization><e:localization lang="sv-FI" exam-type="visually-impaired" hidden="hidden">Lokalisaatio: SV NV <br> </e:localization><e:localization exam-type="hearing-impaired">Lokalisaatio: KV only <br> </e:localization><e:localization exam-type="visually-impaired" hidden="hidden">Lokalisaatio: NV only <br></e:localization><br class="ProseMirror-trailingBreak"></p>'
    )
  })

  it('hides grading instruction localizations not belonging to the opened page', async () => {
    const value = await getProseMirrorContent(page, `${ctx.url}/fi-FI/normal/grading-instructions`)
    expect(value).toContain(
      '</e:localization><e:localization lang="fi-FI" exam-type="hearing-impaired" hidden="hidden">'
    )
    expect(value).toContain('<e:localization lang="fi-FI" exam-type="visually-impaired" hidden="hidden">')
    expect(value).toContain('<e:localization lang="sv-FI" hidden="hidden">')
    expect(value).toContain('<e:localization lang="sv-FI" exam-type="hearing-impaired" hidden="hidden">')
    expect(value).toContain('<e:localization lang="sv-FI" exam-type="visually-impaired" hidden="hidden">')
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

  async function getProseMirrorContent(page: Page, url: string) {
    await page.goto(url)
    await page.waitForSelector('.e-answer-grading-instruction .ProseMirror')
    return getInnerHtml(page, '.e-answer-grading-instruction .ProseMirror')
  }
})