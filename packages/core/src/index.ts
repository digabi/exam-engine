import '../src/css/main.less'
import Attachments from './components/Attachments'
import Exam from './components/Exam'
import ExamResults from './components/ExamResults'
import parseExam from './parser/parseExam'

export * from './components/types'
export { Attachments, Exam, ExamResults, parseExam }

export interface ExamBundle {
  Attachments: typeof Attachments
  Exam: typeof Exam
  parseExam: typeof parseExam
  ExamResults: typeof ExamResults
}
