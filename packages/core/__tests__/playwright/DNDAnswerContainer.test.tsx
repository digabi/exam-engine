import React from 'react'
import { test, expect } from '@playwright/experimental-ct-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { DNDAnswerContainerStory } from './stories/DNDAnswerContainer.story'

test.describe('DNDAnswerContainer', () => {
  test('renders DNDAnswerContainer correctly', async ({ mount }) => {
    const content = readFileSync(resolve(__dirname, './fixtures/basic-dnd-exam.xml'), 'utf-8')
    const xml = readFileSync(resolve(__dirname, './fixtures/basic-dnd-component.xml'), 'utf-8')

    const component = await mount(<DNDAnswerContainerStory content={xml} exam={content} />)

    // Add your assertions here
    await expect(component).toBeVisible()
  })
})
