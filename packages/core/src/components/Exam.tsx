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
import AttachmentLink from './AttachmentLink'
import AttachmentLinks from './AttachmentLinks'
import Audio from './Audio'
import AudioGroup from './AudioGroup'
import AudioTest from './AudioTest'
import ChoiceAnswer from './ChoiceAnswer'
import ChoiceAnswerResult from './ChoiceAnswerResult'
import DocumentTitle from './DocumentTitle'
import DropdownAnswer from './DropdownAnswer'
import ExamAttachment from './ExamAttachment'
import { ExamContext, withExamContext } from './ExamContext'
import ExamFooter from './ExamFooter'
import ExamInstruction from './ExamInstruction'
import ExamQuestion from './ExamQuestion'
import ExamQuestionInstruction from './ExamQuestionInstruction'
import ExamQuestionTitle from './ExamQuestionTitle'
import ExamSection from './ExamSection'
import ExamSectionTitle from './ExamSectionTitle'
import ExternalMaterialList from './ExternalMaterialList'
import File from './File'
import Formula from './Formula'
import Image from './Image'
import References from './References'
import SaveIndicator from './SaveIndicator'
import ScoredTextAnswer from './ScoredTextAnswer'
import ScoredTextAnswers from './ScoredTextAnswers'
import Section from './Section'
import SectionInstruction from './SectionInstruction'
import TableOfContents from './TableOfContents'
import TextAnswer from './TextAnswer'
import { ExamAnswer, ExamServerAPI, InitialCasStatus, RestrictedAudioPlaybackStats } from './types'
import Video from './Video'

export interface ExamProps {
  /** Initial answers */
  answers: ExamAnswer[]
  /** The status of CAS software on the OS */
  casStatus: InitialCasStatus
  /** The CAS countdown duration in seconds. 60 seconds by default. */
  casCountdownDuration?: number
  /**
   * Playback statistics about restricted audio files. Used for calculating
   * whether the user can listen to them any more.
   */
  restrictedAudioPlaybackStats: RestrictedAudioPlaybackStats[]
  /** Exam Server API implementation */
  examServerApi: ExamServerAPI
  /** The URL for the attachments page */
  attachmentsURL: string
  /** A function that maps an attachment filename to a full URI. */
  resolveAttachment: (filename: string) => string
  /** The exam XML */
  doc: XMLDocument
  /** The language of the user interface */
  language: string
  /** Are we displaying results instead of doing exam */
  results?: boolean
}

const renderChildNodesExam = createRenderChildNodes({
  attachment: ExamAttachment,
  'attachment-link': AttachmentLink,
  'attachment-links': AttachmentLinks,
  audio: Audio,
  'audio-group': AudioGroup,
  'audio-test': AudioTest,
  'choice-answer': ChoiceAnswer,
  'dropdown-answer': DropdownAnswer,
  'exam-footer': ExamFooter,
  'external-material': ExternalMaterialList,
  file: File,
  formula: Formula,
  image: Image,
  question: ExamQuestion,
  'question-instruction': ExamQuestionInstruction,
  'question-title': ExamQuestionTitle,
  references: References,
  'scored-text-answer': ScoredTextAnswer,
  'scored-text-answers': ScoredTextAnswers,
  'section-instruction': SectionInstruction,
  section: ExamSection,
  'section-title': ExamSectionTitle,
  'text-answer': TextAnswer,
  video: Video
})

const renderChildNodesResults = createRenderChildNodes({
  attachment: ExamAttachment,
  'attachment-link': AttachmentLink,
  'attachment-links': AttachmentLinks,
  'audio-group': AudioGroup,
  'choice-answer': ChoiceAnswerResult,
  'dropdown-answer': DropdownAnswer,
  'exam-footer': ExamFooter,
  'external-material': ExternalMaterialList,
  file: File,
  formula: Formula,
  image: Image,
  question: ExamQuestion,
  'question-instruction': ExamQuestionInstruction,
  'question-title': ExamQuestionTitle,
  references: References,
  'scored-text-answer': ScoredTextAnswer,
  'scored-text-answers': ScoredTextAnswers,
  'section-instruction': SectionInstruction,
  section: ExamSection,
  'section-title': ExamSectionTitle,
  'text-answer': TextAnswer,
  video: Video
})

export class Exam extends PureComponent<ExamProps> {
  private store: Store<AppState>
  private ref: React.RefObject<HTMLDivElement>
  private i18n: i18n

  constructor(props: ExamProps) {
    super(props)
    this.ref = React.createRef()
    const root = props.doc.documentElement
    this.i18n = initI18n(props.language, root.getAttribute('exam-code'), root.getAttribute('day-code'))
    this.store = initializeStore(
      props.casStatus,
      props.answers,
      props.restrictedAudioPlaybackStats,
      props.examServerApi
    )
  }

  componentDidMount() {
    scrollToHash()
  }

  render() {
    const { doc, language } = this.props
    const root = doc.documentElement
    const examTitle = this.props.results ? null : findChildElement(root, 'exam-title')
    const examInstruction = this.props.results ? null : findChildElement(root, 'exam-instruction')
    const tableOfContents = this.props.results ? null : findChildElement(root, 'table-of-contents')
    const externalMaterial = this.props.results ? null : findChildElement(root, 'external-material')
    const examStylesheet = root.getAttribute('exam-stylesheet')

    if (this.i18n.language !== language) {
      this.i18n.changeLanguage(language)
    }

    const renderChildNodes = this.props.results ? renderChildNodesResults : renderChildNodesExam

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
                  {examInstruction && <ExamInstruction {...{ element: examInstruction, renderChildNodes }} />}
                  {tableOfContents && <TableOfContents {...{ element: tableOfContents, renderChildNodes }} />}
                  {externalMaterial && (
                    <ExternalMaterialList {...{ element: externalMaterial, renderChildNodes, forceRender: true }} />
                  )}
                </Section>
                {renderChildNodes(root)}
              </main>
            )}
          </ExamContext.Consumer>
          <SaveIndicator />
        </I18nextProvider>
      </Provider>
    )
  }
}

export default React.memo(withExamContext(Exam))
