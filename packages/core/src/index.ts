import '../src/css/main.less'
import Attachments from './components/attachments/Attachments'
import Exam from './components/exam/Exam'
import GradingInstructions from './components/grading-instructions/GradingInstructions'
import Results from './components/results/Results'
import parseExam from './parser/parseExam'

export { Attachments, Exam, GradingInstructions, Results, parseExam }
export { ExamComponentProps } from './createRenderChildNodes'
export { GradingAnswer } from './components/grading/GradingAnswer'
export * from './types/ExamAnswer'
export * from './types/ExamServerAPI'
export * from './types/GradingStructure'
export * from './types/Score'
export * from './i18n/exams'
export * from './i18n/exam_titles_fi-FI'
export * from './i18n/exam_titles_sv-FI'

export interface ExamBundle {
  Attachments: typeof Attachments
  Exam: typeof Exam
  parseExam: typeof parseExam
  Results: typeof Results
}
