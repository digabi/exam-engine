import React from 'react'
import { test, expect, MountResult } from '@playwright/experimental-ct-react'
import { AudioAnswerStory } from '../stories/exam/AudioAnswer.story'
import { GetMediaMetadata, masterExam } from '@digabi/exam-engine-mastering'
import { AudioPlayerPage } from '../pages/AudioPlayer.page'

const RECORD = 'Äänitä vastaus'
const STOP = 'Lopeta äänitys'
const DELETE = 'Poista äänitteesi'

test.describe('AudioAnswer', () => {
  let component: MountResult

  test.beforeEach(async ({ mount }) => {
    const results = await masterExam(audioXml, () => '', getMediaMetadata)
    const examXml = results[0].xml
    component = await mount(<AudioAnswerStory examXml={examXml} />)
  })

  test('contains only button to start recording', async () => {
    await expectStartRecordingButtonToBeVisible()
  })

  test('clicking start button starts recording', async () => {
    await startRecording()
    await expectStopRecordingButtonToBeVisible()
  })

  test('clicking stop button after start stops recording and shows player for the recording', async () => {
    await startRecording()
    await expectTimeElapsed('0:02')
    await stopRecording()
    await expectAudioPlayerToBeVisible()
  })

  test('recording shows time elapsed', async () => {
    await startRecording()
    await expectTimeElapsed('0:01')
    await expectTimeElapsed('0:02')
    await expectTimeElapsed('0:03')
    await stopRecording()
  })

  test('recorded audio can be deleted', async () => {
    await startRecording()
    await expectTimeElapsed('0:03')
    await stopRecording()
    await expectDeleteRecordingButtonToBeVisible()
    await deleteRecording()
    await expectStartRecordingButtonToBeVisible()
  })

  test('recording is available for one audio recorder at the time', async () => {
    await startRecording()
    await expectTimeElapsed('0:01')
    await expectAlreadyRecordingError(1)
  })

  async function expectButtonToBeVisible(name: string, nth: number) {
    await expect(component.getByTestId('audio-answer').nth(nth).getByRole('button', { name })).toBeVisible()
  }

  async function expectStartRecordingButtonToBeVisible(nth: number = 0) {
    await expectButtonToBeVisible(RECORD, nth)
  }

  async function expectStopRecordingButtonToBeVisible(nth: number = 0) {
    await expectButtonToBeVisible(STOP, nth)
  }

  async function expectDeleteRecordingButtonToBeVisible(nth: number = 0) {
    await expectButtonToBeVisible(DELETE, nth)
  }

  async function expectAudioPlayerToBeVisible(nth: number = 0) {
    const audioPlayer = new AudioPlayerPage(component, nth)
    await expect(audioPlayer.baseLocator).toBeVisible()
  }

  async function expectAlreadyRecordingError(nth: number = 0) {
    await expect(component.getByTestId('audio-answer').nth(nth)).toContainText(
      'Äänitys on käynnissä toisessa tehtävässä'
    )
  }

  async function expectTimeElapsed(text: string, nth: number = 0) {
    await expect(component.getByTestId('audio-answer-time-elapsed').nth(nth)).toHaveText(text)
  }

  async function pushButton(name: string, nth: number) {
    await component.getByTestId('audio-answer').nth(nth).getByRole('button', { name }).click()
  }

  async function startRecording(nth: number = 0) {
    await expectButtonToBeVisible(RECORD, nth)
    await pushButton(RECORD, nth)
  }

  async function stopRecording(nth: number = 0) {
    await expectButtonToBeVisible(STOP, nth)
    await pushButton(STOP, nth)
  }

  async function deleteRecording(nth: number = 0) {
    await expectButtonToBeVisible(DELETE, nth)
    await pushButton(DELETE, nth)
  }
})

const getMediaMetadata: GetMediaMetadata = (_src, _type) => Promise.resolve({ duration: 999 })

const audioXml = `<e:exam xmlns:e="http://ylioppilastutkinto.fi/exam.xsd" xmlns="http://www.w3.org/1999/xhtml" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://ylioppilastutkinto.fi/exam.xsd https://abitti.net/schema/exam.xsd" exam-schema-version="0.5">
    <e:exam-versions>
        <e:exam-version lang="fi-FI"/>
    </e:exam-versions>
    <e:exam-title>Exam</e:exam-title>
    <e:exam-instruction/>
    <e:table-of-contents/>
    <e:section>
        <e:section-title>Section</e:section-title>
        <e:section-instruction/>
        <e:question>
            <e:question-title>Audiotehtävä</e:question-title>
            <e:question-instruction />
            <e:audio-answer max-score="5" />
            <e:audio-answer max-score="5" />
        </e:question>
    </e:section>
</e:exam>`
