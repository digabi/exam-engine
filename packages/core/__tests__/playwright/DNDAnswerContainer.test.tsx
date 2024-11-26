import React from 'react'
import { readFileSync } from 'fs'
import path from 'path'
import { test, expect } from '@playwright/experimental-ct-react'
import { resolveExam } from '@digabi/exam-engine-exams'
import { getMediaMetadataFromLocalFile, masterExam } from '@digabi/exam-engine-mastering'
import { DNDAnswerContainerStory } from './stories/DNDAnswerContainer.story'

test.describe('DNDAnswerContainer', () => {
  test('renders DNDAnswerContainer correctly', async ({ mount }) => {
    const examPath = resolveExam('SC/SC.xml')
    const resolveAttachment = (filename: string) => path.resolve(path.dirname(examPath), 'attachments', filename)
    const source = readFileSync(examPath, 'utf-8')
    const results = await masterExam(source, () => '', getMediaMetadataFromLocalFile(resolveAttachment), {
      removeCorrectAnswers: false
    })
    const component = await mount(<DNDAnswerContainerStory masteredExam={results} exam={source} />)

    // Add your assertions here
    await expect(component).toBeVisible()
  })
})
