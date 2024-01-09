import { ExamServerAPI } from '@digabi/exam-engine-core'

export default function noopExamServerApi(resolveAttachment: (s: string) => string): ExamServerAPI {
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

  const examServerAPI: ExamServerAPI = {
    getAnswers: () => Promise.resolve([]),
    setCasStatus: casStatus => Promise.resolve(casStatus),
    saveAnswer: () => Promise.resolve(),
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
        audioPlayer.classList.add('audio-player--visible', 'audio-player--animating')
        return 'ok'
      } catch (err) {
        console.error(err)
        return 'other-error'
      }
    },
    async playRestrictedAudio(src) {
      return examServerAPI.playAudio(src)
    },
    getRestrictedAudio() {
      throw new Error('other-error')
    }
  }

  return examServerAPI
}
