import { i18n } from 'i18next'
import React, { PureComponent } from 'react'
import { I18nextProvider } from 'react-i18next'
import { Provider } from 'react-redux'
import { Store } from 'redux'
import { createRenderChildNodes } from '../createRenderChildNodes'
import { findChildElement } from '../dom-utils'
import { initI18n } from '../i18n'
import { scrollToHash } from '../scrollToHash'
import initializeStore, { AppState } from '../store'
import AudioGroup from './AudioGroup'
import ChoiceAnswerResult from './ChoiceAnswerResult'
import DocumentTitle from './DocumentTitle'
import DropdownAnswerResult from './DropdownAnswerResult'
import { ExamProps } from './Exam'
import ExamAttachment from './ExamAttachment'
import { ExamContext, withExamContext } from './ExamContext'
import ExamQuestion from './ExamQuestion'
import ExamQuestionTitleResult from './ExamQuestionTitleResult'
import ExamSection from './ExamSection'
import ExamSectionTitle from './ExamSectionTitle'
import File from './File'
import Formula from './Formula'
import Image from './Image'
import ScoredTextAnswers from './ScoredTextAnswers'
import Section from './Section'
import TextAnswerResult from './TextAnswerResult'

const renderChildNodes = createRenderChildNodes({
  attachment: ExamAttachment,
  'audio-group': AudioGroup,
  'choice-answer': ChoiceAnswerResult,
  'dropdown-answer': DropdownAnswerResult,
  file: File,
  formula: Formula,
  image: Image,
  question: ExamQuestion,
  'question-title': ExamQuestionTitleResult,
  'scored-text-answer': TextAnswerResult,
  'scored-text-answers': ScoredTextAnswers,
  section: ExamSection,
  'section-title': ExamSectionTitle,
  'text-answer': TextAnswerResult
})

export class ExamResults extends PureComponent<ExamProps> {
  private readonly store: Store<AppState>
  private readonly ref: React.RefObject<HTMLDivElement>
  private readonly i18n: i18n

  constructor(props: ExamProps) {
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

export default React.memo(withExamContext(ExamResults))
