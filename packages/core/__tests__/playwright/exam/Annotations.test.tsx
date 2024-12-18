import React from 'react'
import { test, expect } from '@playwright/experimental-ct-react'
import { Locator, Page } from '@playwright/test'
import { setupMasteredExam } from '../utils/utils'
import { AnnotationsStory } from '../stories/exam/Annotations.story'
import { NewExamAnnotation, ExamAnnotation, RenderableAnnotation } from '../../../src'
import { groupBy } from 'lodash'

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

  test('popup field is empty when creating new annotation', async ({ mount, page }) => {
    const component = await mount(
      <AnnotationsStory
        masteredExam={masteredExam}
        annotations={[]}
        onClickAnnotation={() => {}}
        onSaveAnnotation={() => {}}
      />
    )
    const annottatableElement = component.locator('.exam-question-instruction')

    await annotate(annottatableElement, page)
    const textbox = component.locator('.comment-content')
    await textbox.fill('New comment')
    await component.getByText('Tallenna').click()
    await annotate(annottatableElement, page)
    await expect(component.locator('.comment-content')).toHaveText('')
  })

  test('callback is called when annotation is clicked', async ({ mount }) => {
    let annotationCallback = {}
    function handleOnClickAnnotation(
      _event: React.MouseEvent<HTMLElement, MouseEvent>,
      annotation: RenderableAnnotation
    ) {
      annotationCallback = annotation
    }

    const component = await mount(
      <AnnotationsStory
        masteredExam={masteredExam}
        annotations={createAnnotations([{ id: 1, startIndex: 5, selectedText: 'moraali että' }])}
        onClickAnnotation={handleOnClickAnnotation}
        onSaveAnnotation={() => {}}
      />
    )

    await component.locator('[data-annotation-id="1"]').click()

    expect(annotationCallback).toStrictEqual({
      annotationAnchor: 'e:exam:0 > e:section:1 > e:question:2 > e:question-instruction:1 > span:0 > p:1 > #text:0',
      annotationId: 1,
      hidden: false,
      length: 12,
      selectedText: 'moraali että',
      startIndex: 5,
      markNumber: 1
    })
  })

  test('annotations are added to dom when provided', async ({ mount }) => {
    const component = await mount(
      <AnnotationsStory
        masteredExam={masteredExam}
        annotations={createAnnotations([
          { id: 1, startIndex: 27, selectedText: 'pienempi' },
          { id: 3, startIndex: 166, selectedText: 'yhteisössä' }
        ])}
        onClickAnnotation={() => {}}
        onSaveAnnotation={() => {}}
      />
    )

    await expect(component.locator('[data-annotation-id="1"]')).toBeVisible()
    await expect(component.locator('[data-annotation-id="1"]')).toHaveText('pienempi')
    await expect(component.locator('[data-annotation-id="1"] sup')).toHaveAttribute('data-content', '1')
    await expect(component.locator('[data-annotation-id="3"]')).toBeVisible()
    await expect(component.locator('[data-annotation-id="3"]')).toHaveText('yhteisössä')
    await expect(component.locator('[data-annotation-id="3"] sup')).toHaveAttribute('data-content', '2')
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
        onSaveAnnotation={() => {}}
      />
    )
    await expect(component.locator('[data-annotation-id="1"]')).toBeVisible()
    await expect(component.locator('[data-annotation-id="1"]')).toHaveText('yhteisössä')
    await expect(component.locator('[data-annotation-id="1"] sup')).toHaveAttribute('data-content', '1')
  })

  test('if two annotations have same id, only latter renders <sup>', async ({ mount }) => {
    const component = await mount(
      <AnnotationsStory
        masteredExam={masteredExam}
        annotations={createAnnotations([
          { id: 1, startIndex: 71, selectedText: 'jokin' },
          { id: 1, startIndex: 77, selectedText: 'koulu' },
          { id: 2, startIndex: 142, selectedText: 'mikä' },
          { id: 2, startIndex: 147, selectedText: 'ero' }
        ])}
        onClickAnnotation={() => {}}
        onSaveAnnotation={() => {}}
      />
    )
    const marks = async (id: string) => await component.locator(`.e-annotation[data-annotation-id="${id}"]`).all()
    const marksId1 = await marks('1')
    const marksId2 = await marks('2')
    await expect(marksId1[0]).toHaveText('jokin')
    await expect(marksId1[0].locator('sup')).not.toBeVisible()
    await expect(marksId1[1]).toHaveText('koulu')
    await expect(marksId1[1]).toBeVisible()
    await expect(marksId1[1].locator('sup')).toHaveAttribute('data-content', '1')

    await expect(marksId2[0]).toHaveText('mikä')
    await expect(marksId2[0].locator('sup')).not.toBeVisible()
    await expect(marksId2[1]).toHaveText('ero')
    await expect(marksId2[1]).toBeVisible()
    await expect(marksId2[1].locator('sup')).toHaveAttribute('data-content', '2')
  })

  test('hidden annotation works correctly', async ({ mount }) => {
    const component = await mount(
      <AnnotationsStory
        masteredExam={masteredExam}
        annotations={createAnnotations([{ id: 1, startIndex: 59, selectedText: 'esimerkiksi', hidden: true }])}
        onClickAnnotation={() => {}}
        onSaveAnnotation={() => {}}
      />
    )
    await expect(component.locator('[data-annotation-id="1"]')).toBeHidden()
    await expect(component.locator('[data-annotation-id="1"] sup')).toBeHidden()
    await expect(component.locator('[data-annotation-id="1"]').locator('..')).toHaveAttribute(
      'data-annotation-path',
      'e:exam:0 > e:section:1 > e:question:2 > e:question-instruction:1 > span:0 > p:1 > #text:0'
    )
  })

  test('annotations can not overlap — overlapping annotations are not rendered', async ({ mount }) => {
    const component = await mount(
      <AnnotationsStory
        masteredExam={masteredExam}
        annotations={createAnnotations([
          { id: 1, startIndex: 59, selectedText: 'esimerkiksi' },
          { id: 2, startIndex: 62, selectedText: 'merkiksi jo' },
          { id: 3, startIndex: 65, selectedText: 'kiksi jokin' },
          { id: 4, startIndex: 71, selectedText: 'jokin koulu' } // does NOT overlap with the first annotation
        ])}
        onClickAnnotation={() => {}}
        onSaveAnnotation={() => {}}
      />
    )
    await expect(component.locator('[data-annotation-id="1"]')).toBeVisible()
    await expect(component.locator('[data-annotation-id="1"] sup')).toBeVisible()
    await expect(component.locator('[data-annotation-id="1"]')).toHaveText('esimerkiksi')

    await expect(component.locator('[data-annotation-id="2"]')).toBeHidden()
    await expect(component.locator('[data-annotation-id="2"] sup')).toBeHidden()
    await expect(component.locator('[data-annotation-id="2"]')).toHaveText('')

    await expect(component.locator('[data-annotation-id="3"]')).toBeHidden()
    await expect(component.locator('[data-annotation-id="3"] sup')).toBeHidden()
    await expect(component.locator('[data-annotation-id="3"]')).toHaveText('')

    await expect(component.locator('[data-annotation-id="4"]')).toBeVisible()
    await expect(component.locator('[data-annotation-id="4"] sup')).toBeVisible()
    await expect(component.locator('[data-annotation-id="4"]')).toHaveText('jokin koulu')
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
