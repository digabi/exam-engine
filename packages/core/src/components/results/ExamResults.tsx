import { i18n } from 'i18next'
import React, { PureComponent, useContext } from 'react'
import { I18nextProvider, Translation } from 'react-i18next'
import { Provider } from 'react-redux'
import { Store } from 'redux'
import { createRenderChildNodes } from '../../createRenderChildNodes'
import { findChildElement } from '../../dom-utils'
import { initI18n } from '../../i18n'
import { scrollToHash } from '../../scrollToHash'
import initializeStore, { AppState } from '../../store'
import DocumentTitle from '../DocumentTitle'
import { ExamProps } from '../Exam'
import ExamAttachment from '../ExamAttachment'
import { ExamContext, withExamContext } from '../ExamContext'
import ExamSection from '../ExamSection'
import ExamSectionTitle from '../ExamSectionTitle'
import File from '../File'
import Formula from '../Formula'
import Hints from '../Hints'
import Image from '../Image'
import Section from '../Section'
import { AnswerScore, GradingStructure } from '../types'
import ChoiceAnswerResult from './ExamResultsChoiceAnswer'
import DropdownAnswerResult from './ExamResultsDropdownAnswer'
import ExamQuestionResult from './ExamQuestionResult'
import ExamQuestionTitleResult from './ExamQuestionTitleResult'
import { ExamResultsContext, withExamResultsContext } from './ExamResultsContext'
import TextAnswerResult from './TextAnswerResult'
import RenderChildNodes from '../RenderChildNodes'

export interface ExamResultsProps extends ExamProps {
  /** Custom grading text to be displayed for the whole exam. For example total grade for the exam. */
  gradingText?: string
  /** Contains grading structure for the exam, and in addition scores and metadata (comments and annotations) */
  gradingStructure?: GradingStructure
  scores?: AnswerScore[]
}

const renderChildNodes = createRenderChildNodes({
  attachment: ExamAttachment,
  'audio-group': RenderChildNodes,
  'choice-answer': ChoiceAnswerResult,
  'dropdown-answer': DropdownAnswerResult,
  file: File,
  formula: Formula,
  image: Image,
  question: ExamQuestionResult,
  'question-title': ExamQuestionTitleResult,
  'scored-text-answer': TextAnswerResult,
  hints: Hints,
  section: ExamSection,
  'section-title': ExamSectionTitle,
  'text-answer': TextAnswerResult
})

export class ExamResults extends PureComponent<ExamResultsProps> {
  private readonly store: Store<AppState>
  private readonly ref: React.RefObject<HTMLDivElement>
  private readonly i18n: i18n

  constructor(props: ExamResultsProps) {
    super(props)
    this.ref = React.createRef()
    const root = props.doc.documentElement
    this.i18n = initI18n(props.language, root.getAttribute('exam-code'), root.getAttribute('day-code'))
    this.store = initializeStore('forbidden', props.answers, [], this.props.examServerApi)
  }

  componentDidMount() {
    scrollToHash()
  }

  render() {
    const { doc, language } = this.props
    const root = doc.documentElement
    const examTitle = findChildElement(root, 'exam-title')
    const examStylesheet = root.getAttribute('exam-stylesheet')

    if (this.i18n.language !== language) {
      this.i18n.changeLanguage(language)
    }

    return (
      <Provider store={this.store}>
        <I18nextProvider i18n={this.i18n}>
          <ExamContext.Consumer>
            {({ date, dateTimeFormatter, resolveAttachment }) => (
              <main className="e-exam" lang={language} ref={this.ref}>
                <React.StrictMode />
                {examStylesheet && <link rel="stylesheet" href={resolveAttachment(examStylesheet)} />}
                <Section aria-labelledby="title">
                  {examTitle && <DocumentTitle id="title">{renderChildNodes(examTitle)}</DocumentTitle>}
                  {date && (
                    <p>
                      <strong>{dateTimeFormatter.format(date)}</strong>
                    </p>
                  )}

                  <ScoresAndFinalGrade />
                </Section>
                {renderChildNodes(root)}
              </main>
            )}
          </ExamContext.Consumer>
        </I18nextProvider>
      </Provider>
    )
  }
}

function ScoresAndFinalGrade() {
  const { gradingText, totalScore } = useContext(ExamResultsContext)

  return (
    <div>
      <span className="e-column">
        <Translation>{t => t('exam-total')}</Translation>:
      </span>
      <strong className="e-column e-column--narrow table-of-contents--score-column">
        <Translation>{t => t('points', { count: totalScore })}</Translation>
      </strong>
      {gradingText && (
        <div>
          <span className="e-column">
            <Translation>{t => t('grade')}</Translation>:
          </span>
          <strong className="e-column e-column--narrow table-of-contents--score-column">{gradingText}</strong>
        </div>
      )}
    </div>
  )
}

export default React.memo(withExamContext(withExamResultsContext(ExamResults)))
