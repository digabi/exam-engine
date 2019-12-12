import { ExamServerAPI } from '@digabi/exam-engine-core'

export default function noopExamServerApi(resolveAttachment: (s: string) => string) {
  // Emulate real exam restricted audio playback by playing the audio files in a
  // HTML5 <audio> tag. The tag is made visible when starting playback and hidden
  // when playback finishes.
  const audioPlayer = new Audio()
  audioPlayer.classList.add('audio-player')
  audioPlayer.controls = true
  audioPlayer.onended = () => {
    audioPlayer.classList.remove('audio-player--visible')
  }
  document.body.appendChild(audioPlayer)

  const examServerAPI: ExamServerAPI = {
    async getAnswers() {
      return []
    },
    async setCasStatus(casStatus) {
      return casStatus
    },
    async saveAnswer() {
      return
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
    async playAudio(src) {
      audioPlayer.src = resolveAttachment(src)

      try {
        await audioPlayer.play()
        audioPlayer.classList.add('audio-player--visible')
        return 'ok'
      } catch (err) {
        console.error(err) // tslint:disable-line no-console
        return 'other-error'
      }
    },
    async playRestrictedAudio(src) {
      return examServerAPI.playAudio(src)
    }
  }

  return examServerAPI
}
