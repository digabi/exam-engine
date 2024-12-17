import React from 'react'
import { test, expect } from '@playwright/experimental-ct-react'
import { setupMasteredExam, annotate } from '../utils/utils'
import { AttachmentsStory } from '../stories/attachments/Attachments.story'

test.describe('Attachments', () => {
  let masteredExam: Awaited<ReturnType<typeof setupMasteredExam>>

  test.beforeAll(async () => {
    masteredExam = await setupMasteredExam('FF')
  })

  test('text can be annotated inside attachments', async ({ mount, page }) => {
    let callbackArg = ''
    const component = await mount(
      <AttachmentsStory
        masteredExam={masteredExam}
        annotations={[]}
        onClickAnnotation={() => {}}
        onSaveAnnotation={(_newAnnotation, comment: string) => {
          callbackArg = comment
        }}
      />
    )
    const annottatableElement = component.locator('.e-annotatable').first()
    const textbox = component.locator('.comment-content')

    await expect(annottatableElement).toBeVisible()
    await annotate(annottatableElement, page)
    await expect(component.getByTestId('e-popup')).toBeVisible()

    await textbox.fill('New comment')
    await component.getByText('Tallenna').click()
    expect(callbackArg).toBe('New comment')
  })
})
