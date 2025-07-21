import { ExamAnswer, ExamServerAPI } from '.'
import Dexie from 'dexie'

/** Creates a mock Exam Server API, backed by a local IndexedDB database. */
export function indexedDBExamServerAPI(examUuid: string, resolveAttachment: (s: string) => string): ExamServerAPI {
  const db = new (class extends Dexie {
    answer!: Dexie.Table<ExamAnswer & { examUuid: string }, string>
    audio!: Dexie.Table<{ blob: Blob; dataUrl: string; audioId: string }, string>
    constructor() {
      super('exam')
      this.version(1).stores({
        answer: '[examUuid+questionId], examUuid',
        audio: 'audioId'
      })
    }
  })()

  // Emulate real exam restricted audio playback by playing the audio files in a
  // HTML5 <audio> tag. The tag is made visible when starting playback and hidden
  // when playback finishes.
  const audioPlayer = new Audio()
  audioPlayer.classList.add('audio-player')
  audioPlayer.controls = true
  audioPlayer.onended = () => {
    audioPlayer.classList.add('audio-player--animating')
    audioPlayer.classList.remove('audio-player--visible')
  }

  const animationFinished = () => audioPlayer.classList.remove('audio-player--animating')
  audioPlayer.addEventListener('transitionend', animationFinished)
  audioPlayer.addEventListener('transitioncancel', animationFinished)

  document.body.appendChild(audioPlayer)

  const examServerApi: ExamServerAPI = {
    setCasStatus: casStatus => Promise.resolve(casStatus),
    getAnswers: () => db.answer.where({ examUuid }).toArray(),
    saveAnswer: async answer => {
      await db.answer.put({ ...answer, examUuid })
    },
    async saveAudio(questionId: number, audio: Blob) {
      const audioId = `${examUuid}-${questionId}`
      const previouslySavedAudio = await db.audio.get(audioId)
      const combinedAudio = previouslySavedAudio
        ? new Blob([previouslySavedAudio.blob, audio], { type: audio.type })
        : audio
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = async () => {
          const dataUrl = String(reader.result as string)
          await db.audio.put({ blob: combinedAudio, dataUrl, audioId })
          resolve(dataUrl)
        }
        reader.onerror = () => {
          reader.abort()
          reject(reader.error as DOMException)
        }
        reader.readAsDataURL(combinedAudio)
      })
    },
    async deleteAudio(dataUrl: string) {
      const audio = await db.audio
        .filter(
          audio => audio.dataUrl.includes(dataUrl) // operator == does not find audio, because of value.split('/') in AudioAnswer.tsx
        )
        .first()
      if (audio) {
        await db.audio.delete(audio.audioId)
      }
      return Promise.resolve()
    },
    async playAudio(src) {
      audioPlayer.src = resolveAttachment(src)

      try {
        await audioPlayer.play()
        audioPlayer.classList.add('audio-player--visible', 'audio-player--animating')
        return 'ok'
      } catch (err) {
        console.error(err)
        return 'other-error'
      }
    },
    async playRestrictedAudio(src) {
      return examServerApi.playAudio(src)
    },
    getRestrictedAudio() {
      throw new Error('other-error')
    },
    saveScreenshot(_, file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          resolve(String(reader.result as string))
        }
        reader.onerror = () => {
          reader.abort()
          reject(reader.error as DOMException)
        }
        reader.readAsDataURL(file)
      })
    }
  }

  return examServerApi
}
