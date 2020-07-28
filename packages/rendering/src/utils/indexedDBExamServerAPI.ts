import { ExamAnswer, ExamServerAPI } from '@digabi/exam-engine-core'
import Dexie from 'dexie'

/** Creates a mock Exam Server API, backed by a local IndexedDB database. */
export default function indexedDBExamServerAPI(
  examUuid: string,
  resolveAttachment: (s: string) => string
): ExamServerAPI {
  const db = new (class extends Dexie {
    answer!: Dexie.Table<ExamAnswer & { examUuid: string }, string>
    constructor() {
      super('exam')
      this.version(1).stores({
        answer: '[examUuid+questionId], examUuid',
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
    async setCasStatus(casStatus) {
      return casStatus
    },
    async getAnswers() {
      return db.answer.where({ examUuid }).toArray()
    },
    async saveAnswer(answer) {
      if (answer.value === '') {
        const { questionId } = answer
        await db.answer.where({ examUuid, questionId }).delete()
      } else {
        await db.answer.put({ ...answer, examUuid })
      }
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
    saveScreenshot(_, file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          resolve(String(reader.result))
        }
        reader.onerror = () => {
          reader.abort()
          reject(reader.error)
        }
        reader.readAsDataURL(file)
      })
    },
  }

  return examServerApi
}
