import Attachments from './components/Attachments'
import Exam from './components/Exam'
import Results from './components/results/Results'
import parseExam from './parser/parseExam'

export { Attachments, Exam, Results, parseExam }
export type { ExamComponentProps } from './createRenderChildNodes'
export * from './types/ExamAnswer'
export * from './types/ExamServerAPI'
export * from './types/GradingStructure'
export * from './types/Score'

export interface ExamBundle {
  Attachments: typeof Attachments
  Exam: typeof Exam
  parseExam: typeof parseExam
}
