import { ExamServerAPI } from '../src'

export const examServerApi: ExamServerAPI = {
  getAnswers: () => Promise.resolve([]),
  setCasStatus: casStatus => Promise.resolve(casStatus),
  saveAnswer: () => Promise.resolve(),
  saveScreenshot: () => Promise.resolve('ok'),
  saveAudio: () => Promise.resolve('ok'),
  deleteAudio: () => Promise.resolve(),
  playAudio: () => Promise.resolve('ok'),
  playRestrictedAudio: () => Promise.resolve('ok'),
  getRestrictedAudio: () => Promise.resolve(new Blob()),
  examineExam: () => undefined
}
