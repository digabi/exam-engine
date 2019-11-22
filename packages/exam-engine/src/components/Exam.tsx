import React, { PureComponent } from 'react'
import { Provider } from 'react-redux'
import { Store } from 'redux'
import { createRenderChildNodes } from '../createRenderChildNodes'
import { findChildElementByLocalName } from '../dom-utils'
import { initI18n } from '../i18n'
import { scrollToHash } from '../scrollToHash'
import initializeStore, { AppState } from '../store'
import AttachmentLink from './AttachmentLink'
import AttachmentLinks from './AttachmentLinks'
import Audio from './Audio'
import AudioGroup from './AudioGroup'
import AudioTest from './AudioTest'
import ChoiceAnswer from './ChoiceAnswer'
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
}

const renderChildNodes = createRenderChildNodes({
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

export class Exam extends PureComponent<ExamProps> {
  private store: Store<AppState>
  private ref: React.RefObject<HTMLDivElement>

  constructor(props: ExamProps) {
    super(props)
    this.ref = React.createRef()
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
    const examTitle = findChildElementByLocalName(root, 'exam-title')
    const examInstruction = findChildElementByLocalName(root, 'exam-instruction')
    const tableOfContents = findChildElementByLocalName(root, 'table-of-contents')
    const externalMaterial = findChildElementByLocalName(root, 'external-material')
    const examStylesheet = root.getAttribute('exam-stylesheet')

    initI18n(language, root.getAttribute('exam-code'), root.getAttribute('day-code'))

    return (
      <Provider store={this.store}>
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
      </Provider>
    )
  }
}

export default React.memo(withExamContext(Exam))
