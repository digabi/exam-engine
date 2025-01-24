import React from 'react'
import { test, expect } from '@playwright/experimental-ct-react'
import { setupMasteredExam, annotate } from './utils/utils'
import { AnnotationsStory } from './stories/Annotations.story'
import { ExamAnnotation } from '../../src'
import { groupBy } from 'lodash'

test.describe('Annotations', () => {
  let masteredExam: Awaited<ReturnType<typeof setupMasteredExam>>

  test.beforeAll(async () => {
    masteredExam = await setupMasteredExam('FF')
  })

  test('annotation popup is not rendered if annotation props are not passed', async ({ mount, page }) => {
    const component = await mount(<AnnotationsStory masteredExam={masteredExam} />)
    const element = component.locator('.exam-question-instruction')

    await annotate(element, page)
    await expect(component.getByTestId('e-popup')).not.toBeVisible()
  })

  test('text can be annotated and annotations can be viewed when annotation props are passed', async ({
    mount,
    page
  }) => {
    let callbackArgs = { newAnnotation: {}, comment: '', renderableAnnotation: {} }
    const existingAnnotations = [
      { id: 1, startIndex: 27, selectedText: 'pienempi' },
      { id: 2, startIndex: 166, selectedText: 'yhteisössä' },
      { id: 3, startIndex: 59, selectedText: 'esimerkiksi', hidden: true },
      { id: 4, startIndex: 142, selectedText: 'mikä' },
      { id: 4, startIndex: 147, selectedText: 'ero' },
      { id: 5, startIndex: 59, selectedText: 'esimerkiksi' },
      { id: 6, startIndex: 62, selectedText: 'merkiksi jo' },
      { id: 7, startIndex: 65, selectedText: 'kiksi jokin' },
      { id: 8, startIndex: 71, selectedText: 'jokin koulu' }
    ]
    const component = await mount(
      <AnnotationsStory
        masteredExam={masteredExam}
        annotations={createAnnotations(existingAnnotations)}
        onClickAnnotation={(_event, renderableAnnotation) => {
          callbackArgs = { ...callbackArgs, renderableAnnotation }
        }}
        onSaveAnnotation={{
          fn: (newAnnotation, comment: string) => {
            callbackArgs = { ...callbackArgs, newAnnotation, comment }
          }
        }}
      />
    )
    const annottatableElement = component.locator('.exam-question-instruction')
    const annotationLocator = (id: number) => component.locator(`[data-annotation-id="${id}"]`)

    await test.step('rendering  annotations', async () => {
      await test.step('non-hidden, unique and not-overlapping annotations are rendered correctly', async () => {
        for (const annotation of existingAnnotations.slice(0, 2)) {
          await expect(annotationLocator(annotation.id)).toBeVisible()
          await expect(annotationLocator(annotation.id)).toHaveText(annotation.selectedText)
          await expect(annotationLocator(annotation.id).locator('+ sup')).toHaveAttribute(
            'data-content',
            annotation.id.toString()
          )
        }
      })

      await test.step('hidden annotations are hidden', async () => {
        await expect(annotationLocator(3)).toBeHidden()
        await expect(annotationLocator(3).locator('+ sup')).toBeHidden()
        await expect(annotationLocator(3).locator('..')).toHaveAttribute(
          'data-annotation-path',
          'e:exam:0 > e:section:1 > e:question:2 > e:question-instruction:1 > span:0 > p:1 > #text:0'
        )
      })

      await test.step('if two annotations have same id, only latter renders <sup>', async () => {
        const marks = await annotationLocator(4).all()
        await expect(marks[0]).toHaveText('mikä')
        await expect(marks[0].locator('+ sup')).not.toBeVisible()
        await expect(marks[1]).toHaveText('ero')
        await expect(marks[1]).toBeVisible()
        await expect(marks[1].locator('+ sup')).toHaveAttribute('data-content', '4')
      })

      await test.step('annotations can not overlap — overlapping annotations are not rendered', async () => {
        await expect(annotationLocator(5)).toBeVisible()
        await expect(annotationLocator(5).locator('+ sup')).toBeVisible()
        await expect(annotationLocator(5)).toHaveText('esimerkiksi')

        await expect(annotationLocator(6)).toBeHidden()
        await expect(annotationLocator(6).locator('+ sup')).toBeHidden()
        await expect(annotationLocator(6)).toHaveText('')

        await expect(annotationLocator(7)).toBeHidden()
        await expect(annotationLocator(7).locator('+ sup')).toBeHidden()
        await expect(annotationLocator(7)).toHaveText('')

        await expect(annotationLocator(8)).toBeVisible()
        await expect(annotationLocator(8).locator('+ sup')).toBeVisible()
        await expect(annotationLocator(8)).toHaveText('jokin koulu')
      })
    })

    await test.step('creating annotations', async () => {
      await test.step('annotation popup appears when text is selected', async () => {
        await expect(component.getByTestId('e-popup')).not.toBeVisible()
        await annotate(annottatableElement, page)
        await expect(component.getByTestId('e-popup')).toBeVisible()
      })

      await test.step('callback is called when annotation is saved', async () => {
        const textbox = component.locator('.comment-content')
        await textbox.fill('New comment')
        await component.getByText('Tallenna').click()

        expect(callbackArgs.comment).toBe('New comment')
        expect(callbackArgs.newAnnotation).toStrictEqual({
          annotationParts: [
            {
              annotationAnchor:
                'e:exam:0 > e:section:1 > e:question:2 > e:question-instruction:1 > span:0 > p:0 > #text:0',
              selectedText: 'Sekä moraali että tavat pyr',
              startIndex: 0,
              length: 27
            }
          ],
          displayNumber: '2',
          selectedText: 'Sekä moraali että tavat pyr'
        })
      })

      await test.step('popup field is empty when creating new annotation', async () => {
        await annotate(annottatableElement, page)
        await expect(component.locator('.comment-content')).toHaveText('')
      })

      await test.step('popup can be closed', async () => {
        await component.getByText('Peru').click()
        await expect(component.getByTestId('e-popup')).not.toBeVisible()
      })

      await test.step('callback is called when annotation is clicked', async () => {
        await component.locator('[data-annotation-id="1"]').click()

        expect(callbackArgs.renderableAnnotation).toStrictEqual({
          annotationAnchor: 'e:exam:0 > e:section:1 > e:question:2 > e:question-instruction:1 > span:0 > p:1 > #text:0',
          annotationId: 1,
          hidden: false,
          length: 8,
          resolved: undefined,
          selectedText: 'pienempi',
          startIndex: 27,
          markNumber: 1
        })
      })
    })
  })

  test('"August 2024" annotations are added to dom when provided', async ({ mount }) => {
    /** the difference of startIndex between an "August 2024 annotation" and a normal annotation
     * (in this case, but the index varies depending on the exam content)
     */
    const startIndexDifference = 24
    const component = await mount(
      <AnnotationsStory
        masteredExam={masteredExam}
        annotations={createAnnotations([{ id: 1, startIndex: 166 - startIndexDifference, selectedText: 'yhteisössä' }])}
        onClickAnnotation={() => {}}
        onSaveAnnotation={{ fn: () => {} }}
      />
    )
    await expect(component.locator('[data-annotation-id="1"]')).toBeVisible()
    await expect(component.locator('[data-annotation-id="1"]')).toHaveText('yhteisössä')
    await expect(component.locator('[data-annotation-id="1"] + sup')).toHaveAttribute('data-content', '1')
  })

  test('annotation popup is not closed when annotation save fails', async ({ mount, page }) => {
    const errorMessage = 'save failed'
    const component = await mount(
      <AnnotationsStory
        masteredExam={masteredExam}
        annotations={[]}
        onClickAnnotation={() => {}}
        onSaveAnnotation={{ fn: () => {}, result: errorMessage }}
      />
    )

    await expect(component.getByTestId('e-popup')).not.toBeVisible()
    await annotate(component.locator('.exam-question-instruction'), page)
    await component.locator('.comment-content').fill('New comment')
    await component.getByText('Tallenna').click()
    await expect(component.getByTestId('e-popup')).toBeVisible()
    await expect(component.getByText(errorMessage)).toBeVisible()
  })

  function createAnnotations(annotations: Annotation[]): ExamAnnotation[] {
    const annotationsById = groupBy(annotations, 'id')
    return Object.keys(annotationsById).map((id, index) => {
      const annotationParts = annotationsById[id]
      return {
        annotationId: Number(id),
        selectedText: annotations.map(a => a.selectedText).join(' '),
        type: 'text',
        displayNumber: '2',
        hidden: annotationParts.some(a => a.hidden),
        markNumber: index + 1,
        annotationParts: annotationParts.map(p => ({
          startIndex: p.startIndex,
          length: p.selectedText.length,
          annotationAnchor: 'e:exam:0 > e:section:1 > e:question:2 > e:question-instruction:1 > span:0 > p:1 > #text:0',
          selectedText: p.selectedText,
          annotationId: Number(id)
        }))
      }
    })
  }

  type Annotation = { id: number; startIndex: number; selectedText: string; hidden?: boolean }
})
