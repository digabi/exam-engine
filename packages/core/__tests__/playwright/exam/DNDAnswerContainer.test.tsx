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
        firstOptionLocator,
        secondOptionLocator,
        firstAnswerContent,
        secondAnswerContent
      } = await setupAnswerContext(component, answerMediaType)

      await test.step('Drag first answer to answer container', async () => {
        const draggableLocator = firstOptionLocator.locator('.drag-handle')
        await draggableLocator.dragTo(answerContainer)
        await assertContentMatches(answerContainer, firstAnswerContent, answerMediaType)
        await assertContentDoesNotMatch(answerOptionsLocator, firstAnswerContent, answerMediaType)
        await assertContentMatches(answerOptionsLocator, secondAnswerContent, answerMediaType)
      })

      await test.step('Replace first answer with second answer in answer container', async () => {
        const draggableLocator = secondOptionLocator.locator('.drag-handle')
        await draggableLocator.dragTo(answerContainer)
        await assertContentMatches(answerContainer, secondAnswerContent, answerMediaType)
        await assertContentDoesNotMatch(answerContainer, firstAnswerContent, answerMediaType)
        await assertContentMatches(answerOptionsLocator, firstAnswerContent, answerMediaType)
      })

      await test.step('Drag second answer back to options', async () => {
        const draggableLocator = answerContainer.locator('.drag-handle')
        await draggableLocator.dragTo(answerOptionsLocator)
        await expect(answerContainer).toContainText('Ei vastausta')
        await assertContentMatches(answerOptionsLocator, firstAnswerContent, answerMediaType)
        await assertContentMatches(answerOptionsLocator, secondAnswerContent, answerMediaType)
      })

      await test.step('Move first answer to answer container using keyboard', async () => {
        // We test DOM changes between key presses to make sure that DOM is updated correctly.
        // For text answers: the answer option #343 is moved to answer containers 102 -> 101 -> 100.
        // For image answers: the answer option #351 is moved to answer containers 103 -> 103 -> 103.
        const handle = firstOptionLocator.locator('.drag-handle')
        const helperText = component.locator('#DndLiveRegion-0')
        const isTextAnswer = answerMediaType === 'text'
        const baseText = `Draggable item ${isTextAnswer ? 343 : 351} was moved over droppable area`
        await handle.focus()
        await handle.press('Enter')
        await expect(helperText).toContainText(`${baseText} root.`)
        await handle.press('ArrowUp') // activates root container
        await expect(helperText).toContainText(`${baseText} root.`)
        await handle.press('ArrowUp') // activates 3rd answer
        await expect(helperText).toContainText(`${baseText} ${isTextAnswer ? 102 : 103}.`)
        await handle.press('ArrowUp') // activates 2nd answer
        await expect(helperText).toContainText(`${baseText} ${isTextAnswer ? 101 : 103}.`)
        await handle.press('ArrowUp') // activates 1st answer
        await expect(helperText).toContainText(`${baseText} ${isTextAnswer ? 100 : 103}.`)
        await handle.press('Enter')
        const firstAnswerContent = (await getAnswerContent(firstOptionLocator, answerMediaType)) || '' // first option has changed
        await assertContentMatches(answerContainer, firstAnswerContent, answerMediaType)
      })
    })
  }
})

async function assertContentMatches(answerContainer: Locator, content: string, mediaType: 'text' | 'image') {
  if (mediaType === 'text') {
    await expect(answerContainer).toContainText(content)
  } else if (mediaType === 'image') {
    const images = await answerContainer.locator('img').all()
    let found = false
    for (const img of images) {
      const src = await img.getAttribute('src')
      if (src === content) {
        found = true
        break
      }
    }
    expect(found).toBe(true)
  }
}

async function assertContentDoesNotMatch(answerContainer: Locator, content: string, mediaType: 'text' | 'image') {
  if (mediaType === 'text') {
    await expect(answerContainer).not.toContainText(content)
  } else if (mediaType === 'image') {
    const images = await answerContainer.locator('img').all()
    for (const img of images) {
      await expect(img).not.toHaveAttribute('src', content)
    }
  }
}

async function setupAnswerContext(component: Locator, answerMediaType: 'text' | 'image') {
  const answerContainer = component.getByTestId('dnd-droppable').first()
  const answerOptionsLocator = component.getByTestId('dnd-droppable').last()
  const firstOptionLocator = component.getByTestId('dnd-answer-option').nth(0)
  const secondOptionLocator = component.getByTestId('dnd-answer-option').nth(1)
  const firstAnswerContent = await getAnswerContent(firstOptionLocator, answerMediaType)
  const secondAnswerContent = await getAnswerContent(secondOptionLocator, answerMediaType)

  return {
    answerContainer,
    answerOptionsLocator,
    firstOptionLocator,
    secondOptionLocator,
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
