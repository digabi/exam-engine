import React from 'react'
import { test, expect } from '@playwright/experimental-ct-react'
import { QuestionStory } from '../stories/exam/Question.story'

test.describe('TextAnswerInput', () => {
  test('integer input accepts unicode minus sign', async ({ mount }) => {
    const component = await mount(<QuestionStory examXml={examXml} />)
    await component.locator('input').type('−5')
    await expect(component.locator('input')).toHaveValue('−5')
  })

  test('integer input accepts ascii hyphen minus sign', async ({ mount }) => {
    const component = await mount(<QuestionStory examXml={examXml} />)
    await component.locator('input').type('-5')
    await expect(component.locator('input')).toHaveValue('-5')
  })

  test('rich text undo and redo move a whole debounced edit at a time', async ({ mount, page }) => {
    // The editor's answer history is debounced by 500 ms, so everything typed within a
    // single burst must be undone and redone as one step, not character by character.
    const historyTimeout = 550
    const component = await mount(<QuestionStory examXml={richTextExamXml} />)
    const editor = component.getByTestId('rich-text-editor')

    await editor.click()
    await page.keyboard.type('aa')
    await page.waitForTimeout(historyTimeout)
    await page.keyboard.type('bb')
    await page.waitForTimeout(historyTimeout)
    await expect(editor).toHaveText('aabb')

    await page.keyboard.press('ControlOrMeta+z')
    await expect(editor).toHaveText('aa')

    await page.keyboard.press('ControlOrMeta+z')
    await expect(editor).toHaveText('')

    await page.keyboard.press(redoShortcut)
    await expect(editor).toHaveText('aa')

    await page.keyboard.press(redoShortcut)
    await expect(editor).toHaveText('aabb')
  })
})

const redoShortcut = process.platform === 'darwin' ? 'Meta+Shift+z' : 'Control+y'

const examXml = `<e:exam xmlns:e="http://ylioppilastutkinto.fi/exam.xsd" xmlns="http://www.w3.org/1999/xhtml" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://ylioppilastutkinto.fi/exam.xsd https://abitti.net/schema/exam.xsd" exam-schema-version="0.5">
    <e:exam-versions>
        <e:exam-version lang="fi-FI"/>
    </e:exam-versions>
    <e:exam-title>Exam</e:exam-title>
    <e:exam-instruction/>
    <e:table-of-contents/>
    <e:section>
        <e:section-title>Section</e:section-title>
        <e:section-instruction/>
        <e:question display-number="1">
            <e:question-title>Kokonaislukutehtävä</e:question-title>
            <e:question-instruction>
                <br/>
            </e:question-instruction>
            <e:text-answer type="integer" max-score="1"/>
        </e:question>
    </e:section>
</e:exam>`

const richTextExamXml = `<e:exam xmlns:e="http://ylioppilastutkinto.fi/exam.xsd" xmlns="http://www.w3.org/1999/xhtml" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://ylioppilastutkinto.fi/exam.xsd https://abitti.net/schema/exam.xsd" exam-schema-version="0.5" exam-lang="fi-FI">
    <e:exam-versions>
        <e:exam-version lang="fi-FI"/>
    </e:exam-versions>
    <e:exam-title>Exam</e:exam-title>
    <e:exam-instruction/>
    <e:table-of-contents/>
    <e:section>
        <e:section-title>Section</e:section-title>
        <e:section-instruction/>
        <e:question display-number="1" question-id="1" max-score="6">
            <e:question-title>Tekstitehtävä</e:question-title>
            <e:question-instruction>
                <br/>
            </e:question-instruction>
            <e:text-answer type="rich-text" max-score="6" question-id="2" display-number="1"/>
        </e:question>
    </e:section>
</e:exam>`
