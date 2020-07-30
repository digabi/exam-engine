import { ExamServerAPI } from '../src'

export const examServerApi: ExamServerAPI = {
  async getAnswers() {
    return []
  },
  async setCasStatus(casStatus) {
    return casStatus
  },
  async saveAnswer() {
    return
  },
  async saveScreenshot() {
    return 'ok'
  },
  async playAudio() {
    return 'ok'
  },
  async playRestrictedAudio() {
    return 'ok'
  },
}
