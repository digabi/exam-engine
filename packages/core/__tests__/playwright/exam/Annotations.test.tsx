import React from 'react'
import { test, expect } from '@playwright/experimental-ct-react'
import { Locator, Page } from '@playwright/test'
import { setupMasteredExam } from '../utils/utils'
import { AnnotationsStory } from '../stories/exam/Annotations.story'
import { NewExamAnnotation } from '../../../src'

test.describe('Annotations', () => {
  let masteredExam: Awaited<ReturnType<typeof setupMasteredExam>>

  test.beforeAll(async () => {
    masteredExam = await setupMasteredExam('FF')
  })

  test('popup is rendered when text is annotated', async ({ mount, page }) => {
    const component = await mount(
      <AnnotationsStory
        masteredExam={masteredExam}
        annotations={[]}
        onClickAnnotation={() => {}}
        onSaveAnnotation={() => {}}
      />
    )
    const annottatableElement = component.locator('.exam-question-instruction')

    await expect(component.getByTestId('e-popup')).not.toBeVisible()
    await annotate(annottatableElement, page)
    await expect(component.getByTestId('e-popup')).toBeVisible()
  })

  test('popup is not rendered if annotation props are not passed', async ({ mount, page }) => {
    const component = await mount(<AnnotationsStory masteredExam={masteredExam} />)
    const element = component.locator('.exam-question-instruction')

    await annotate(element, page)
    await expect(component.getByTestId('e-popup')).not.toBeVisible()
  })

  test('callback is called when annotation is saved', async ({ mount, page }) => {
    let callbackArgs = { newAnnotation: {}, comment: '' }
    function handleSaveAnnotation(newAnnotation: NewExamAnnotation, comment: string) {
      callbackArgs = { newAnnotation, comment }
    }

    const component = await mount(
      <AnnotationsStory
        masteredExam={masteredExam}
        annotations={[]}
        onClickAnnotation={() => {}}
        onSaveAnnotation={handleSaveAnnotation}
      />
    )
    const annottatableElement = component.locator('.exam-question-instruction')

    await annotate(annottatableElement, page)
    const textbox = component.locator('.comment-content')
    await textbox.fill('New comment')
    await component.getByText('Tallenna').click()
    console.log('saved', callbackArgs?.newAnnotation)

    expect(callbackArgs.comment).toBe('New comment')
    expect(callbackArgs.newAnnotation).toStrictEqual({
      annotationParts: [
        {
          annotationAnchor: 'e:exam:0 > e:section:1 > e:question:2 > e:question-instruction:1 > span:0 > p:0 > #text:0',
          selectedText: 'Sekä moraali että tavat pyr',
          startIndex: 0,
          length: 27
        }
      ],
      displayNumber: '2',
      selectedText: 'Sekä moraali että tavat pyr'
    })
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
