import { ExamServerAPI } from '../src'

export const examServerApi: ExamServerAPI = {
  getAnswers: () => Promise.resolve([]),
  setCasStatus: casStatus => Promise.resolve(casStatus),
  saveAnswer: () => Promise.resolve(),
  saveScreenshot: () => Promise.resolve('ok'),
  playAudio: () => Promise.resolve('ok'),
  playRestrictedAudio: () => Promise.resolve('ok'),
  finishExam: () => undefined,
  endSession: () => Promise.resolve()
}
