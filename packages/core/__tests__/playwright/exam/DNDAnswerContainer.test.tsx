import React from 'react'
import { readFileSync } from 'fs'
import path from 'path'
import { test, expect } from '@playwright/experimental-ct-react'
import { Locator } from '@playwright/test'
import { resolveExam } from '@digabi/exam-engine-exams'
import { getMediaMetadataFromLocalFile, masterExam, MasteringResult } from '@digabi/exam-engine-mastering'
import { DNDAnswerContainerStory } from '../stories/exam/DNDAnswerContainer.story'

test.describe('DNDAnswerContainer', () => {
  let masteredExam: MasteringResult

  test.beforeAll(async () => {
    masteredExam = await setupMasteredExam()
  })

  for (const answerMediaType of ['text', 'image'] as const) {
    test(`Connect - basic drag and drop functionality for ${answerMediaType} answers`, async ({ mount }) => {
      const component = await mount(
        <DNDAnswerContainerStory masteredExam={masteredExam} answerMediaType={answerMediaType} />
      )
      const {
        answerContainer,
        answerOptionsLocator,
        firstAnswerLocator,
        secondAnswerLocator,
        firstAnswerContent,
        secondAnswerContent
      } = await setupAnswerContext(component, answerMediaType)

      await test.step('Drag first answer to answer container', async () => {
        const draggableLocator = firstAnswerLocator.locator('.drag-handle')
        await draggableLocator.dragTo(answerContainer)
        await assertContentMatches(answerContainer, firstAnswerContent, answerMediaType)
      })

      await test.step('Replace first answer with second answer in answer container', async () => {
        const draggableLocator = secondAnswerLocator.locator('.drag-handle')
        await draggableLocator.dragTo(answerContainer)
        await assertContentMatches(answerContainer, secondAnswerContent, answerMediaType)
      })

      await test.step('Drag second answer back to options', async () => {
        const draggableLocator = answerContainer.locator('.drag-handle')
        await draggableLocator.dragTo(answerOptionsLocator)
        await expect(answerContainer).toContainText('Ei vastausta')
      })
    })
  }
})

async function setupMasteredExam() {
  const examPath = resolveExam('SC/SC.xml')
  const resolveAttachment = (filename: string) => path.resolve(path.dirname(examPath), 'attachments', filename)
  const examXml = readFileSync(examPath, 'utf-8')
  const [masteredExam] = await masterExam(examXml, () => '', getMediaMetadataFromLocalFile(resolveAttachment), {
    removeCorrectAnswers: true
  })
  return masteredExam
}

async function assertContentMatches(answerContainer: Locator, content: string, mediaType: 'text' | 'image') {
  if (mediaType === 'text') {
    await expect(answerContainer).toContainText(content)
  } else if (mediaType === 'image') {
    await expect(answerContainer.locator('img')).toHaveAttribute('src', content)
  }
}

async function setupAnswerContext(component: Locator, answerMediaType: 'text' | 'image') {
  const answerContainer = component.getByTestId('dnd-droppable').first()
  const answerOptionsLocator = component.getByTestId('dnd-droppable').last()
  const firstAnswerLocator = component.getByTestId('dnd-answer-option').nth(0)
  const secondAnswerLocator = component.getByTestId('dnd-answer-option').nth(1)
  const firstAnswerContent = await getAnswerContent(firstAnswerLocator, answerMediaType)
  const secondAnswerContent = await getAnswerContent(secondAnswerLocator, answerMediaType)

  return {
    answerContainer,
    answerOptionsLocator,
    firstAnswerLocator,
    secondAnswerLocator,
    firstAnswerContent: firstAnswerContent as string,
    secondAnswerContent: secondAnswerContent as string
  }
}

async function getAnswerContent(answerLocator: Locator, mediaType: 'text' | 'image') {
  if (mediaType === 'text') {
    return await answerLocator.textContent()
  } else if (mediaType === 'image') {
    return await answerLocator.locator('img').getAttribute('src')
  }
}
