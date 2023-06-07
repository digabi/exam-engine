import React, { createRef, useContext, useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'
import { Provider } from 'react-redux'
import { ExamAnswer, ExamServerAPI, InitialCasStatus, RestrictedAudioPlaybackStats } from '../../index'
import { createRenderChildNodes } from '../../createRenderChildNodes'
import { findChildElement } from '../../dom-utils'
import { changeLanguage, initI18n } from '../../i18n'
import { examTitleId } from '../../ids'
import { parseExamStructure } from '../../parser/parseExamStructure'
import { scrollToHash } from '../../scrollToHash'
import { initializeExamStore } from '../../store'
import { useCached } from '../../useCached'
import mkAttachmentLink from '../shared/AttachmentLink'
import mkAttachmentLinks from '../shared/AttachmentLinks'
import Audio from '../shared/Audio'
import AudioGroup from '../shared/AudioGroup'
import AudioTest from '../shared/AudioTest'
import ChoiceAnswer from './ChoiceAnswer'
import { CommonExamContext, withCommonExamContext } from '../context/CommonExamContext'
import DocumentTitle from '../DocumentTitle'
import DropdownAnswer from './DropdownAnswer'
import ErrorIndicator from './internal/ErrorIndicator'
import ExamAttachment from './Attachment'
import { withExamContext } from '../context/ExamContext'
import ExamFooter from './ExamFooter'
import ExamInstruction from './ExamInstruction'
import Question from './Question'
import QuestionInstruction from './QuestionInstruction'
import QuestionTitle from './QuestionTitle'
import Section from './Section'
import SectionTitle from './SectionTitle'
import ExternalMaterial from './ExternalMaterial'
import File from '../shared/File'
import Formula from '../shared/Formula'
import Hints from './Hints'
import Image from '../shared/Image'
import ImageOverlay from '../shared/ImageOverlay'
import References from '../shared/References'
import SaveIndicator from './internal/SaveIndicator'
import SectionElement from '../SectionElement'
import SectionInstruction from './SectionInstruction'
import { mkTableOfContents } from '../shared/TableOfContents'
import TextAnswer from './TextAnswer'
import Video from '../shared/Video'
import RenderChildNodes from '../RenderChildNodes'
import * as _ from 'lodash-es'

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
  /** @deprecated Not used anymore */
  language?: string
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
  'audio-title': RenderChildNodes,
  'audio-group': AudioGroup,
  'audio-test': AudioTest,
  'choice-answer': ChoiceAnswer,
  'dropdown-answer': DropdownAnswer,
  'exam-footer': ExamFooter,
  'external-material': ExternalMaterial,
  file: File,
  formula: Formula,
  image: Image,
  question: Question,
  'question-instruction': QuestionInstruction,
  'question-title': QuestionTitle,
  hints: Hints,
  references: References,
  'scored-text-answer': TextAnswer,
  'scored-text-answers': Hints,
  'section-instruction': SectionInstruction,
  section: Section,
  'section-title': SectionTitle,
  'text-answer': TextAnswer,
  video: Video,
  'image-overlay': ImageOverlay,
})

const Exam: React.FunctionComponent<ExamProps> = ({
  doc,
  casStatus,
  answers,
  restrictedAudioPlaybackStats,
  examServerApi,
}) => {
  const { date, dateTimeFormatter, dayCode, examCode, language, resolveAttachment, root, subjectLanguage } =
    useContext(CommonExamContext)

  const examTitle = findChildElement(root, 'exam-title')
  const examInstruction = findChildElement(root, 'exam-instruction')
  const tableOfContents = findChildElement(root, 'table-of-contents')
  const externalMaterial = findChildElement(root, 'external-material')
  const examStylesheet = root.getAttribute('exam-stylesheet')

  const examRef = createRef<HTMLDivElement>()

  const store = useCached(() =>
    initializeExamStore(parseExamStructure(doc), casStatus, answers, restrictedAudioPlaybackStats, examServerApi)
  )
  const TableOfContents = useCached(() =>
    mkTableOfContents({ showAttachmentLinks: true, showAnsweringInstructions: true })
  )

  const i18n = useCached(() => initI18n(language, examCode, dayCode))
  useEffect(changeLanguage(i18n, language))

  useEffect(scrollToHash, [])

  const handleExamScroll = (e: React.SyntheticEvent<HTMLDivElement>) => {
    const scrollY = e.currentTarget.scrollTop
    const sections = document.querySelectorAll('.exam-question')

    // Find the section currently in view
    sections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top + scrollY
      const sectionBottom = section.getBoundingClientRect().bottom + scrollY

      const sectionFillsView = scrollY > sectionTop && scrollY <= sectionBottom
      const sectionBeginsInView = scrollY > sectionTop - window.innerHeight && scrollY <= sectionTop

      const id = section.querySelector('.anchor')?.id || ''
      if (sectionFillsView || sectionBeginsInView) {
        document.querySelector(`.table-of-contents li[data-list-number="${id}."]`)?.classList.add('current')
      } else {
        document.querySelector(`.table-of-contents li[data-list-number="${id}."]`)?.classList.remove('current')
      }
    })
  }

  const throttledScroll = _.throttle(handleExamScroll, 50, { trailing: false })

  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <main className="e-exam" lang={subjectLanguage} aria-labelledby={examTitleId} ref={examRef}>
          <React.StrictMode />
          {examStylesheet && <link rel="stylesheet" href={resolveAttachment(examStylesheet)} />}

          <div className="halves">
            {tableOfContents && (
              <div className="sidebar-toc-container">
                <TableOfContents {...{ element: tableOfContents, renderChildNodes }} />
              </div>
            )}

            <div className="main-exam-container" onScroll={throttledScroll}>
              <div className="main-exam">
                <SectionElement aria-labelledby={examTitleId}>
                  {examTitle && <DocumentTitle id={examTitleId}>{renderChildNodes(examTitle)}</DocumentTitle>}
                  {date && (
                    <p>
                      <strong>{dateTimeFormatter.format(date)}</strong>
                    </p>
                  )}
                  {examInstruction && <ExamInstruction {...{ element: examInstruction, renderChildNodes }} />}

                  {tableOfContents && (
                    <div className="main-toc-container">
                      <TableOfContents {...{ element: tableOfContents, renderChildNodes }} />
                    </div>
                  )}
                  {externalMaterial && (
                    <ExternalMaterial {...{ element: externalMaterial, renderChildNodes, forceRender: true }} />
                  )}
                </SectionElement>
                {renderChildNodes(root)}
                <div className="e-footer">
                  <ErrorIndicator />
                  <SaveIndicator />
                </div>
              </div>
            </div>
          </div>
        </main>
      </I18nextProvider>
    </Provider>
  )
}

export default React.memo(withExamContext(withCommonExamContext(Exam)))
