import { ExamServerAPI } from '../src/components/types'

export const examServerApi: ExamServerAPI = {
  async getAnswers() {
    return Promise.resolve([])
  },
  async setCasStatus(casStatus) {
    return Promise.resolve(casStatus)
  },
  async saveAnswer() {
    return Promise.resolve()
  },
  async saveScreenshot() {
    return Promise.resolve('ok')
  },
  async playAudio() {
    return Promise.resolve('ok')
  },
  async playRestrictedAudio() {
    return Promise.resolve('ok')
  }
}
