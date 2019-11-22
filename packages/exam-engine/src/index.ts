import Attachments from './components/Attachments'
import Exam from './components/Exam'
import parseExam from './parser/parseExam'

export { Attachments, Exam, parseExam }

export interface ExamBundle {
  Attachments: typeof Attachments
  Exam: typeof Exam
  parseExam: typeof parseExam
}

export * from './components/types'
