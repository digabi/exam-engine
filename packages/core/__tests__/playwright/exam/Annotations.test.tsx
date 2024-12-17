import React from 'react'
import { test, expect } from '@playwright/experimental-ct-react'
import { Locator, Page } from '@playwright/test'
import { setupMasteredExam } from '../utils/utils'
import { AnnotationsStory } from '../stories/exam/Annotations.story'

test.describe('Annotations', () => {
  let masteredExam: Awaited<ReturnType<typeof setupMasteredExam>>

  test.beforeAll(async () => {
    masteredExam = await setupMasteredExam('FF')
  })

  test('popup is rendered when text is annotated', async ({ mount, page }) => {
    const component = await mount(<AnnotationsStory masteredExam={masteredExam} />)
    const annottatableElement = component.locator('.exam-question-instruction')

    await expect(component.getByTestId('e-popup')).not.toBeVisible()
    await annotate(annottatableElement, page)
    await expect(component.getByTestId('e-popup')).toBeVisible()
  })

  async function annotate(locator: Locator, page: Page) {
    const box = await locator.boundingBox()
    if (!box) throw new Error('Bounding box not found')
    const startX = box.x
    const startY = box.y
    const endX = box.x + 200 // Move further to the right to select text
    const endY = startY

    // Simulate dragging the mouse to select text
    await page.mouse.move(startX, startY)
    await page.mouse.down()
    await page.mouse.move(endX, endY)
    await page.mouse.up()
  }
})
