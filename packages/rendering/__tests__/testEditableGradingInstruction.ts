import { resolveExam } from '@digabi/exam-engine-exams'
import { PreviewContext, previewExam } from '@digabi/exam-engine-rendering'
import { Page } from 'puppeteer'
import { initPuppeteer, loadExam } from './puppeteerUtils'

describe('testEditableGradingInstruction.ts — Grading instruction editing', () => {
  const createPage = initPuppeteer()
  let page: Page
  let ctx: PreviewContext

  beforeAll(async () => {
    ctx = await previewExam(resolveExam('SC/SC.xml'), { editableGradingInstructions: true })
    page = await createPage()
  })

  afterAll(async () => {
    await ctx.close()
  })

  describe('list', () => {
    it('New list can be added', async () => {
      await openGradingInstructionsPage()
      await focusOnEditor()
      await page.click('.e-answer-grading-instruction [data-testid="editor-menu-add-list"]')
      const value = await getInnerHtml('.e-answer-grading-instruction .ProseMirror')
      expect(value).toContain(`<ul><li><p><br class="ProseMirror-trailingBreak"></p></li></ul>`)
    })

    it('New list item can be added with enter', async () => {
      await openGradingInstructionsPage()
      await focusOnEditor()
      await page.click('.e-answer-grading-instruction [data-testid="editor-menu-add-list"]')
      await page.type('.e-answer-grading-instruction .ProseMirror li', 'foo')
      await page.keyboard.press('Enter')
      const value = await getInnerHtml('.e-answer-grading-instruction .ProseMirror')
      expect(value).toContain(`<ul><li><p>foo</p></li><li><p><br class="ProseMirror-trailingBreak"></p></li></ul>`)
    })

    it('List can be splitted in half with double enter', async () => {
      await openGradingInstructionsPage()
      await focusOnEditor()
      await page.click('.e-answer-grading-instruction [data-testid="editor-menu-add-list"]')
      await page.type('.e-answer-grading-instruction .ProseMirror li', 'foo')
      await page.keyboard.press('Enter')
      await page.type('.e-answer-grading-instruction .ProseMirror li:nth-child(2)', 'bar')
      await page.click('.e-answer-grading-instruction .ProseMirror li:nth-child(1)')
      await page.keyboard.press('Enter')
      await page.keyboard.press('Enter')
      const value = await getInnerHtml('.e-answer-grading-instruction .ProseMirror')
      expect(value).toContain(
        `<ul><li><p>foo</p></li></ul><p><br class="ProseMirror-trailingBreak"></p><ul><li><p>bar</p></li></ul>`
      )
    })

    it('Indentation can be changed with tab and shift-tab', async () => {
      await openGradingInstructionsPage()
      await focusOnEditor()
      await page.click('.e-answer-grading-instruction [data-testid="editor-menu-add-list"]')
      await page.type('.e-answer-grading-instruction .ProseMirror li', 'foo')
      await page.keyboard.press('Enter')
      await page.keyboard.press('Tab')
      const valueTab = await getInnerHtml('.e-answer-grading-instruction .ProseMirror')
      expect(valueTab).toContain(
        `<ul><li><p>foo</p><ul><li><p><br class="ProseMirror-trailingBreak"></p></li></ul></li></ul>`
      )
      await page.keyboard.down('Shift')
      await page.keyboard.press('Tab')
      await page.keyboard.up('Shift')
      const valueShiftTab = await getInnerHtml('.e-answer-grading-instruction .ProseMirror')
      expect(valueShiftTab).toContain(
        `<ul><li><p>foo</p></li><li><p><br class="ProseMirror-trailingBreak"></p></li></ul>`
      )
    })
  })

  describe('e:formula', () => {
    it('New equation can be added', async () => {
      await openGradingInstructionsPage()
      await addEquation('\\sqrt{1}')
      const value = await getInnerHtml('.e-answer-grading-instruction .ProseMirror')
      expect(value).toContain(
        `<img alt="\\sqrt{1}" formula="true" src="/math.svg?latex=${encodeURIComponent('\\sqrt{1}')}" contenteditable="false">`
      )
    })

    it('New equation cannot be added if formula popup is already open', async () => {
      await openGradingInstructionsPage()
      await focusOnEditor()
      expect(await getDisabledStatus(page, '.e-answer-grading-instruction [data-testid="add-formula"]')).toBeFalsy()
      await addFormula()
      expect(await getDisabledStatus(page, '.e-answer-grading-instruction [data-testid="add-formula"]')).toBeTruthy()
    })

    it('Equation can be deleted', async () => {
      await openGradingInstructionsPage()
      await addEquation('\\sqrt{1}')
      await openEquationEditor(`\\\\sqrt{1}`)
      await page.click('[data-testid="e-popup-delete"]')
      await page.click('[data-testid="e-popup-delete"]')
      const value = await getInnerHtml('.e-answer-grading-instruction .ProseMirror')
      expect(value).not.toContain('src="/math.svg?latex=\\sqrt{1}"')
    })

    it('Added equation can be modified', async () => {
      await openGradingInstructionsPage()
      await addEquation('\\sqrt{1}')
      await openEquationEditor(`\\\\sqrt{1}`)
      await openMathEquationEditor('\\\\sqrt{1}')
      await replaceLatex('\\sqrt{2}')
      await saveEquation()
      const value = await getInnerHtml('.e-answer-grading-instruction .ProseMirror')
      expect(value).toContain(
        `<img alt="\\sqrt{2}" formula="true" src="/math.svg?latex=${encodeURIComponent('\\sqrt{2}')}" contenteditable="false">`
      )
    })

    it('Changes can be cancelled', async () => {
      await openGradingInstructionsPage()
      await addEquation('\\sqrt{1}')
      await openEquationEditor(`\\\\sqrt{1}`)
      await openMathEquationEditor('\\\\sqrt{1}')
      await replaceLatex('\\sqrt{2}')
      await page.click('[data-testid="e-popup-cancel"]')
      const value = await getInnerHtml('.e-answer-grading-instruction .ProseMirror')
      expect(value).toContain(
        `<img alt="\\sqrt{1}" formula="true" src="/math.svg?latex=${encodeURIComponent('\\sqrt{1}')}" contenteditable="false">`
      )
    })

    it('Non-equation cannot be saved and error is shown', async () => {
      await openGradingInstructionsPage()
      await focusOnEditor()
      await addFormula()
      await page.type('.e-popup-content', 'text')
      expect(await page.waitForSelector(`[data-testid="e-popup-save"]:disabled`)).toBeTruthy()
      expect(await getInnerHtml('.e-popup-error')).toBe('Ainoastaan yksi kaava sallittu')
    })

    async function getDisabledStatus(page: Page, selector: string): Promise<boolean> {
      return page.$eval(selector, e => {
        if (e instanceof HTMLButtonElement) {
          return e.disabled
        }
        throw new Error('Not a button')
      })
    }

    async function replaceLatex(latex: string) {
      await clearInput('.math-editor-latex-field')
      await page.type('.math-editor-latex-field', latex)
    }

    async function openEquationEditor(latex: string) {
      await page.click(`img[alt="${latex}"]`)
    }

    async function openMathEquationEditor(latex: string) {
      await page.click(`.e-popup img[alt="${latex}"]`)
    }

    async function clearInput(selector: string) {
      await page.evaluate(selector => {
        const input = document.querySelector(selector) as HTMLInputElement
        input.value = ''
        input.dispatchEvent(new Event('input', { bubbles: true })) //
      }, selector)
    }

    async function addEquation(latex: string) {
      await focusOnEditor()
      await addFormula()
      await addMathEquation()
      await page.type('.math-editor-latex-field', latex)
      await saveEquation()
    }

    async function saveEquation() {
      await page.click(`.e-popup-button-area`)
      await page.waitForSelector(`[data-testid="e-popup-save"]:not(:disabled)`)
      await page.click('[data-testid="e-popup-save"]')
    }

    async function addFormula() {
      await page.click('.e-answer-grading-instruction [data-testid="add-formula"]')
    }

    async function addMathEquation() {
      await page.waitForSelector('.rich-text-editor-tools-row')
      await page.keyboard.down('Control')
      await page.keyboard.press('KeyE')
      await page.keyboard.up('Control')
    }
  })

  async function focusOnEditor() {
    await page.click(`.e-answer-grading-instruction .ProseMirror`)
  }

  async function openGradingInstructionsPage() {
    await loadExam(page, ctx.url)
    await page.goto(`${ctx.url}/fi-FI/normal/grading-instructions`)
  }

  async function getInnerHtml(selector: string) {
    const element = await page.waitForSelector(selector)
    return element!.evaluate(el => el.innerHTML)
  }
})
