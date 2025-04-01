import { expect, test } from '@playwright/experimental-ct-react'
import React from 'react'
import { ExamStory } from '../stories/exam/Exam.story'
import { setupMasteredExam } from '../utils/utils'

test.describe.configure({ mode: 'serial' })

test.describe('Exam', () => {
  let masteredExam_SC: Awaited<ReturnType<typeof setupMasteredExam>>
  let masteredExamNoAttachments: Awaited<ReturnType<typeof setupMasteredExam>>

  test.beforeAll(async () => {
    masteredExam_SC = await setupMasteredExam()
    masteredExamNoAttachments = await setupMasteredExam('test/no_attachments.xml')
  })

  test('exam without attachments contains notification', async ({ mount }) => {
    const component = await mount(<ExamStory masteredExam={masteredExamNoAttachments} />)
    const notification = component.locator('.notification').getByText('Tämä koe ei sisällä aineistoja')
    await expect(notification).toBeVisible()
  })

  test('exam with attachments contains no notification', async ({ mount }) => {
    const component = await mount(<ExamStory masteredExam={masteredExam_SC} />)
    const notification = component.locator('.notification').getByText('Tämä koe ei sisällä aineistoja')
    await expect(notification).not.toBeVisible()
  })
})
