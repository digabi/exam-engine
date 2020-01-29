import { GradingStructure } from '@digabi/exam-engine-mastering'
import { i18n } from 'i18next'
import React, { PureComponent, useContext } from 'react'
import { I18nextProvider, Translation } from 'react-i18next'
import { Provider } from 'react-redux'
import { Store } from 'redux'
import { createRenderChildNodes } from '../../createRenderChildNodes'
import { findChildElement } from '../../dom-utils'
import { initI18n } from '../../i18n'
import { scrollToHash } from '../../scrollToHash'
import { initializeResultsStore, ResultsState } from '../../store'
import DocumentTitle from '../DocumentTitle'
import { CommonExamProps } from '../Exam'
import ExamAttachment from '../ExamAttachment'
import { ExamAttachmentsContext, withAttachmentsContextForResults } from '../ExamAttachmentsContext'
import ExamSectionTitle from '../ExamSectionTitle'
import Formula from '../Formula'
import Hints from '../Hints'
import Image from '../Image'
import RenderChildNodes from '../RenderChildNodes'
import Section from '../Section'
import { AnswerScore } from '../types'
import ResultsChoiceAnswer from './ResultsChoiceAnswer'
import { ResultsContext, withResultsContext } from './ResultsContext'
import ResultsDropdownAnswer from './ResultsDropdownAnswer'
import ResultsExamQuestion from './ResultsExamQuestion'
import ResultsExamQuestionTitle from './ResultsExamQuestionTitle'
import ResultsExamSection from './ResultsExamSection'
import ResultsTextAnswer from './ResultsTextAnswer'


export type ResultsProps = CommonExamProps & Props

interface Props {
  /** Contains grading structure for the exam, and in addition scores and metadata (comments and annotations) */
  gradingStructure: GradingStructure
  /** Custom grading text to be displayed for the whole exam. For example total grade for the exam. */
  gradingText?: string
  /** Scores for exam questions */
  scores?: AnswerScore[]
}

const renderChildNodes = createRenderChildNodes({
  attachment: ExamAttachment,
  'audio-group': RenderChildNodes,
  'choice-answer': ResultsChoiceAnswer,
  'dropdown-answer': ResultsDropdownAnswer,
  formula: Formula,
  image: Image,
  question: ResultsExamQuestion,
  'question-title': ResultsExamQuestionTitle,
  hints: Hints,
  section: ResultsExamSection,
  'section-title': ExamSectionTitle,
  'text-answer': ResultsTextAnswer,
  'scored-text-answer': ResultsTextAnswer
})

export class Results extends PureComponent<ResultsProps> {
  private readonly store: Store<ResultsState>
  private readonly ref: React.RefObject<HTMLDivElement>
  private readonly i18n: i18n

  constructor(props: ResultsProps) {
    super(props)
    this.ref = React.createRef()
    const root = props.doc.documentElement
    this.i18n = initI18n(props.language, root.getAttribute('exam-code'), root.getAttribute('day-code'))
    this.store = initializeResultsStore(props.answers)
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
          <ResultsContext.Consumer>
            {({ date, dateTimeFormatter }) => (
              <ExamAttachmentsContext.Consumer>
                {({ resolveAttachment }) => (
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
              </ExamAttachmentsContext.Consumer>
            )}
          </ResultsContext.Consumer>
        </I18nextProvider>
      </Provider>
    )
  }
}

function ScoresAndFinalGrade() {
  const { gradingText, totalScore } = useContext(ResultsContext)

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

export default React.memo(withResultsContext(withAttachmentsContextForResults(Results)))
