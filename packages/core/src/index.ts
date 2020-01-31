import '../src/css/main.less'
import Attachments from './components/Attachments'
import Exam from './components/Exam'
import Results from './components/results/Results'
import parseExam from './parser/parseExam'

export * from './components/types'
export { Attachments, Exam, Results, parseExam }

export interface ExamBundle {
  Attachments: typeof Attachments
  Exam: typeof Exam
  parseExam: typeof parseExam
  Results: typeof Results
}
