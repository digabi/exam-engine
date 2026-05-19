import React from 'react'
import { test, expect } from '@playwright/experimental-ct-react'
import { Locator } from '@playwright/test'
import { MultiLineAnswerDelayedScoreStory, MultiLineAnswerStory } from '../stories/results/MultiLineAnswer.story'

test.describe('<MultiLineAnswer /> image opening', () => {
  test('adds a full size image link for downscaled images', async ({ mount }) => {
    const component = await mount(<MultiLineAnswerStory width={80} />)
    const src = await component.locator('img').getAttribute('src')
    expect(src).not.toBeNull()

    await expect(component.locator('.full-size-image a')).toHaveAttribute('target', '_blank')
    await expect(component.locator('.full-size-image a')).toHaveAttribute('href', src!)
  })

  test('does not add a full size image link for images rendered at natural size', async ({ mount }) => {
    const component = await mount(<MultiLineAnswerStory width={240} />)
    await waitForImageLoad(component.locator('img'))

    await expect(component.locator('.full-size-image')).toHaveCount(0)
  })

  test('keeps full size image controls out of delayed annotation rendering', async ({ mount }) => {
    const component = await mount(<MultiLineAnswerDelayedScoreStory />)

    await expect(component.locator('.full-size-image a')).toHaveCount(1)
    await component.getByRole('button', { name: 'Add score' }).click()

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
