import '../src/css/main.less'
import Attachments from './components/Attachments'
import Exam from './components/Exam'
import Results from './components/results/Results'
import parseExam from './parser/parseExam'

export * from './types'
export { Attachments, Exam, Results, parseExam }
export { ExamComponentProps } from './createRenderChildNodes'

export interface ExamBundle {
  Attachments: typeof Attachments
  Exam: typeof Exam
  parseExam: typeof parseExam
  Results: typeof Results
}
export { AnswerError } from './components/RichTextAnswer'
