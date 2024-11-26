import React from 'react'
import { readFileSync } from 'fs'
import path from 'path'
import { test, expect } from '@playwright/experimental-ct-react'
import { resolveExam } from '@digabi/exam-engine-exams'
import { getMediaMetadataFromLocalFile, masterExam, MasteringResult } from '@digabi/exam-engine-mastering'
import { DNDAnswerContainerStory } from './stories/DNDAnswerContainer.story'

test.describe('DNDAnswerContainer', () => {
  let examXml: string
  let masteredExam: MasteringResult

  test.beforeAll(async () => {
    const examPath = resolveExam('SC/SC.xml')
    const resolveAttachment = (filename: string) => path.resolve(path.dirname(examPath), 'attachments', filename)
    examXml = readFileSync(examPath, 'utf-8')
    ;[masteredExam] = await masterExam(examXml, () => '', getMediaMetadataFromLocalFile(resolveAttachment), {
      removeCorrectAnswers: false
    })
  })

  for (const answerMediaType of ['text', 'image'] as const) {
    test(`Connect - basic drag and drop functionality for ${answerMediaType} answers`, async ({ mount }) => {
      const component = await mount(
        <DNDAnswerContainerStory masteredExam={masteredExam} answerMediaType={answerMediaType} />
      )
      const answerOption = component.locator('.e-dnd-answer-option').first()
      const answerOptionTextContent = await answerOption.textContent()
      const draggable = answerOption.locator('.drag-handle')
      const droppable = component.locator('.e-dnd-answer-droppable').first()

      await test.step('Answer option can be dragged from answer options to an answer container ', async () => {
        await draggable.dragTo(droppable)
        await expect(droppable).toContainText(answerOptionTextContent as string)
        if (answerMediaType === 'image') {
          await expect(droppable.locator('img')).toBeVisible()
        }
      })
      await test.step('Answer option gets replaced when other answer option gets dragged into an answer container ', async () => {})
      await test.step('Answer option can get dragged back from answer container to options container ', async () => {})
    })
  }
})
