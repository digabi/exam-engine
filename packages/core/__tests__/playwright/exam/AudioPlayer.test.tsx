import React from 'react'
import { test as baseTest, expect } from '@playwright/experimental-ct-react'
import { getMediaMetadataFromLocalFile, masterExam } from '@digabi/exam-engine-mastering'
import { ExamStory } from '../stories/exam/Exam.story'
import { AudioPlayerPage } from '../pages/AudioPlayer.page' // Import the Page Object
import path from 'path'

const AUDIO_FILE_NAME = 'audio-5s.mp3'
// Renamed for clarity
const AUDIO_PLAYER_EXAM_XML = `<e:exam xmlns:e="http://ylioppilastutkinto.fi/exam.xsd" xmlns="http://www.w3.org/1999/xhtml" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://ylioppilastutkinto.fi/exam.xsd https://abitti.dev/schema/exam.xsd" exam-schema-version="0.5">
    <e:exam-versions>
        <e:exam-version lang="fi-FI"/>
    </e:exam-versions>
    <e:exam-title>Uusi koe</e:exam-title>
    <e:exam-instruction/>
    <e:table-of-contents/>
    <e:section>
        <e:section-title/>
        <e:section-instruction/>
        <e:question>
            <e:question-title/>
            <e:question-instruction/>
            <e:audio src="${AUDIO_FILE_NAME}"/>
        </e:question>
    </e:section>
</e:exam>`

type CustomFixtures = {
  audioPlayerPage: AudioPlayerPage
}

const test = baseTest.extend<CustomFixtures>({
  audioPlayerPage: async ({ page, mount }, use) => {
    const resolveAttachment = (filename: string) => path.resolve(__dirname, '../data', filename)

    const results = await masterExam(AUDIO_PLAYER_EXAM_XML, () => '', getMediaMetadataFromLocalFile(resolveAttachment))
    const masteredExamXml = results[0]

    await page.route(`**/attachments/${AUDIO_FILE_NAME}`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'audio/mpeg',
        path: path.resolve(__dirname, `../data/${AUDIO_FILE_NAME}`)
      })
    })

    const mountResult = await mount(<ExamStory masteredExam={masteredExamXml} />)
    const audioPlayerPageInstance = new AudioPlayerPage(mountResult)
    await use(audioPlayerPageInstance)
  }
})

test('all UI elements are visible and in correct state', async ({ audioPlayerPage }) => {
  await expect(audioPlayerPage.playPauseButton).toBeVisible()
  await expect(audioPlayerPage.playPauseButton).toHaveAttribute('aria-label', 'Play')
  await expect(audioPlayerPage.progressBar).toBeVisible()
  await expect(audioPlayerPage.progressBar).toHaveAttribute('aria-label', '00:00')
  await expect(audioPlayerPage.progressBar).toHaveAttribute('style', /--range-progress: 0%/)
  await expect(audioPlayerPage.currentTimeDisplay).toHaveText('00:00')
  await expect(audioPlayerPage.durationDisplay).toHaveText('00:05')
})

test('player is in correct state after playing whole audio', async ({ page, audioPlayerPage }) => {
  await audioPlayerPage.playPauseButton.click()
  await expect(audioPlayerPage.playPauseButton).toHaveAttribute('aria-label', 'Pause')

  await page.waitForTimeout(6000)
  await expect(audioPlayerPage.currentTimeDisplay).toHaveText('00:05')
  await expect(audioPlayerPage.durationDisplay).toHaveText('00:05')
  await expect(audioPlayerPage.playPauseButton).toHaveAttribute('aria-label', 'Play')
  await expect(audioPlayerPage.progressBar).toHaveValue(/5\.\d*/)
  await expect(audioPlayerPage.progressBar).toHaveAttribute('aria-label', '00:05')
  await expect(audioPlayerPage.progressBar).toHaveAttribute('style', /--range-progress: 100%/)
})
