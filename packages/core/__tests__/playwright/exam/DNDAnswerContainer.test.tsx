import React from 'react'
import { test, expect } from '@playwright/experimental-ct-react'
import { Locator } from '@playwright/test'
import { DNDAnswerContainerStory } from '../stories/exam/DNDAnswerContainer.story'
import { setupMasteredExam } from '../utils/utils'

test.describe.configure({ mode: 'serial' })

test.describe('DNDAnswerContainer', () => {
  let masteredExam: Awaited<ReturnType<typeof setupMasteredExam>>

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

      await test.step('Move first answer to answer container using keyboard', async () => {
        await firstAnswerLocator.locator('.drag-handle').focus()
        await firstAnswerLocator.locator('.drag-handle').press('Enter')
        await firstAnswerLocator.locator('.drag-handle').press('ArrowUp') // activates root container
        await firstAnswerLocator.locator('.drag-handle').press('ArrowUp') // activates 3rd answer container
        await firstAnswerLocator.locator('.drag-handle').press('ArrowUp') // activates 2nd answer container
        await firstAnswerLocator.locator('.drag-handle').press('ArrowUp') // activates 1st answer container
        await firstAnswerLocator.locator('.drag-handle').press('Enter')
        const firstAnswerContent = (await getAnswerContent(firstAnswerLocator, answerMediaType)) || ''
        await assertContentMatches(answerContainer, firstAnswerContent, answerMediaType)
      })
    })
  }
})

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
