import React from 'react'
import { test, expect } from '@playwright/experimental-ct-react'
import { Locator } from '@playwright/test'
import { Score } from '../../../src'
import { MultiLineAnswerStory } from '../stories/results/MultiLineAnswer.story'

const textAnnotationScore: Score = {
  questionId: 1,
  answerId: 1,
  pregrading: {
    score: 1,
    annotations: [{ type: 'text', startIndex: 6, length: 5, message: 'Text annotation' }]
  }
}

test.describe('<MultiLineAnswer /> image opening', () => {
  test('adds a full size image link for downscaled images', async ({ mount }) => {
    const component = await mount(<MultiLineAnswerStory imageWidth={1600} />)
    const src = await component.locator('img').evaluate((img: HTMLImageElement) => img.src)

    await expect(component.locator('.full-size-image a')).toHaveAttribute('target', '_blank')
    await expect(component.locator('.full-size-image a')).toHaveAttribute('href', src)
  })

  test('does not add a full size image link for images rendered at natural size', async ({ mount }) => {
    const component = await mount(<MultiLineAnswerStory imageWidth={400} />)
    await waitForImageLoad(component.locator('img'))

    await expect(component.locator('.full-size-image')).toHaveCount(0)
  })

  test('keeps annotation marks out of the full size image wrapper', async ({ mount }) => {
    const component = await mount(<MultiLineAnswerStory imageWidth={1600} score={textAnnotationScore} />)

    await expect(component.locator('.full-size-image a')).toHaveCount(1)
    await expect(component.locator('.full-size-image mark')).toHaveCount(0)
    await expect(component.locator('mark')).toContainText('World')
  })
})

async function waitForImageLoad(image: Locator) {
  await image.evaluate((img: HTMLImageElement) => {
    if (img.complete) {
      return
    }
    return new Promise<void>(resolve => img.addEventListener('load', () => resolve(), { once: true }))
  })
}
