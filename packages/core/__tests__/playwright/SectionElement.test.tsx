import { test, expect } from '@playwright/experimental-ct-react'
import React from 'react'
import SectionElement from '../../src/components/SectionElement'

test.describe('SectionElement', () => {
  test('renders SectionElement correctly', async ({ mount }) => {
    const content = 'Test SectionElement'
    const component = await mount(
      <div>
        <SectionElement className="custom className">{content}</SectionElement>
      </div>
    )
    const section = component.locator('section')
    await expect(section).toBeVisible()
    await expect(section).toContainText(content)
    await expect(section).toHaveClass(/custom className/)
  })
})
