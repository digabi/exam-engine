import React, { useContext, useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'
import { Provider } from 'react-redux'
import { createRenderChildNodes } from '../createRenderChildNodes'
import { findChildElement } from '../dom-utils'
import { changeLanguage, initI18n } from '../i18n'
import { scrollToHash } from '../scrollToHash'
import { initializeExamStore } from '../store'
import mkAttachmentLink from './AttachmentLink'
import mkAttachmentLinks from './AttachmentLinks'
import Audio from './Audio'
import AudioGroup from './AudioGroup'
import AudioTest from './AudioTest'
import ChoiceAnswer from './ChoiceAnswer'
import { CommonExamContext, withCommonExamContext } from './CommonExamContext'
import DocumentTitle from './DocumentTitle'
import DropdownAnswer from './DropdownAnswer'
import ExamAttachment from './ExamAttachment'
import { withExamContext } from './ExamContext'
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
import Hints from './Hints'
import Image from './Image'
import References from './References'
import SaveIndicator from './SaveIndicator'
import Section from './Section'
import SectionInstruction from './SectionInstruction'
import TableOfContents from './TableOfContents'
import TextAnswer from './TextAnswer'
import Video from './Video'
import { ExamAnswer, ExamServerAPI, InitialCasStatus, RestrictedAudioPlaybackStats } from '..'
import ImageOverlay from './ImageOverlay'
import { examTitleId } from '../ids'
import { useCached } from '../useCached'

/** Props common to taking the exams and viewing results */
export interface CommonExamProps {
  /** Initial answers */
  answers: ExamAnswer[]
  /** The URL for the attachments page */
  attachmentsURL: string
  /** A function that maps an attachment filename to a full URI. */
  resolveAttachment: (filename: string) => string
  /** The exam XML */
  doc: XMLDocument
  /** The language of the user interface */
  language: string
}

/** Props related to taking the exam, 'executing' it */
export interface ExamProps extends CommonExamProps {
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
}

const renderChildNodes = createRenderChildNodes({
  attachment: ExamAttachment,
  'attachment-link': mkAttachmentLink('link'),
  'attachment-links': mkAttachmentLinks('link'),
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
  hints: Hints,
  references: References,
  'scored-text-answer': TextAnswer,
  'scored-text-answers': Hints,
  'section-instruction': SectionInstruction,
  section: ExamSection,
  'section-title': ExamSectionTitle,
  'text-answer': TextAnswer,
  video: Video,
  'image-overlay': ImageOverlay,
})

const Exam: React.FunctionComponent<ExamProps> = ({
  casStatus,
  answers,
  restrictedAudioPlaybackStats,
  examServerApi,
}) => {
  const { date, dateTimeFormatter, language, resolveAttachment, root } = useContext(CommonExamContext)

  const examTitle = findChildElement(root, 'exam-title')
  const examInstruction = findChildElement(root, 'exam-instruction')
  const tableOfContents = findChildElement(root, 'table-of-contents')
  const externalMaterial = findChildElement(root, 'external-material')
  const examStylesheet = root.getAttribute('exam-stylesheet')

  const store = useCached(() => initializeExamStore(casStatus, answers, restrictedAudioPlaybackStats, examServerApi))

  const examCode = root.getAttribute('exam-code')
  const dayCode = root.getAttribute('day-code')
  const i18n = useCached(() => initI18n(language, examCode, dayCode))
  useEffect(changeLanguage(i18n, language))

  useEffect(scrollToHash, [])

  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <main className="e-exam" lang={language} aria-labelledby={examTitleId}>
          <React.StrictMode />
          {examStylesheet && <link rel="stylesheet" href={resolveAttachment(examStylesheet)} />}
          <Section aria-labelledby={examTitleId}>
            {examTitle && <DocumentTitle id={examTitleId}>{renderChildNodes(examTitle)}</DocumentTitle>}
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
          <SaveIndicator />
        </main>
      </I18nextProvider>
    </Provider>
  )
}

export default React.memo(withExamContext(withCommonExamContext(Exam)))
