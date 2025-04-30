import React from 'react'
import { test, expect } from '@playwright/experimental-ct-react'
import { QuestionStory } from '../stories/exam/Question.story'

test.describe('TextAnswerInput', () => {
  test('integer input accepts unicode minus sign', async ({ mount }) => {
    const component = await mount(<QuestionStory examXml={examXml} />)
    await component.locator('input').type('−5')
    await expect(component.locator('input')).toHaveValue('\u22125')
  })

  test('integer input accepts ascii hyphen minus sign', async ({ mount }) => {
    const component = await mount(<QuestionStory examXml={examXml} />)
    await component.locator('input').type('-5')
    await expect(component.locator('input')).toHaveValue('\u002D5')
  })
})

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
