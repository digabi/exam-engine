import React, { createRef, useContext, useEffect, useMemo, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import { Provider } from 'react-redux'
import { createRenderChildNodes, RenderComponentOverrides } from '../../createRenderChildNodes'
import { findChildElement, query } from '../../dom-utils'
import { changeLanguage, initI18n, useExamTranslation } from '../../i18n'
import { examTitleId } from '../../ids'
import { ExamAnswer, ExamServerAPI, InitialCasStatus, RestrictedAudioPlaybackStats } from '../../index'
import { parseExamStructure } from '../../parser/parseExamStructure'
import { scrollToHash } from '../../scrollToHash'
import { initializeExamStore } from '../../store'
import { RichTextAnswer, TextAnswer as TextAnswerType } from '../../types/ExamAnswer'
import { useCached } from '../../useCached'
import DocumentTitle from '../DocumentTitle'
import NotificationIcon from '../NotificationIcon'
import RenderChildNodes from '../RenderChildNodes'
import SectionElement from '../SectionElement'
import { AnnotationProvider } from '../context/AnnotationProvider'
import { CommonExamContext, withCommonExamContext } from '../context/CommonExamContext'
import { withExamContext } from '../context/ExamContext'
import { TOCContext } from '../context/TOCContext'
import mkAttachmentLink from '../shared/AttachmentLink'
import mkAttachmentLinks from '../shared/AttachmentLinks'
import Audio from '../shared/Audio'
import AudioGroup from '../shared/AudioGroup'
import AudioTest from '../shared/AudioTest'
import ExamTranslation from '../shared/ExamTranslation'
import File from '../shared/File'
import { Footer } from '../shared/Footer'
import Formula from '../shared/Formula'
import Image from '../shared/Image'
import ImageOverlay from '../shared/ImageOverlay'
import { QuestionNumber } from '../shared/QuestionNumber'
import References from '../shared/References'
import { mkTableOfContents } from '../shared/TableOfContents'
import { VersionNumber } from '../shared/VersionNumber'
import Video from '../shared/Video'
import ExamAttachment from './Attachment'
import ChoiceAnswer from './ChoiceAnswer'
import { DNDAnswerContainer } from './DNDAnswerContainer'
import DropdownAnswer from './DropdownAnswer'
import ExamFooter from './ExamFooter'
import ExamInstruction from './ExamInstruction'
import ExternalMaterial from './ExternalMaterial'
import GoToExamineAnswersButton from './GoToExamineAnswersButton'
import Hints from './Hints'
import Question from './Question'
import QuestionInstruction from './QuestionInstruction'
import QuestionTitle from './QuestionTitle'
import Section from './Section'
import SectionInstruction from './SectionInstruction'
import SectionTitle from './SectionTitle'
import { StudentNameHeader } from './StudentNameHeader'
import TextAnswer from './TextAnswer'
import { UndoView } from './UndoView'
import ErrorIndicator from './internal/ErrorIndicator'
import SaveIndicator from './internal/SaveIndicator'
import AudioAnswer from './AudioAnswer'
import { withAudioRecorderContext } from '../context/AudioRecorderContext'

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
  abitti2?: boolean
  renderComponentOverrides?: RenderComponentOverrides
}

export interface AnnotationProps {
  annotationsEnabled?: boolean
}

interface UndoViewProps {
  close: () => void
  restoreAnswer: (examAnswer: TextAnswerType | RichTextAnswer) => void
  questionId: number
  title: string
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
  studentName: string
  showUndoView: boolean
  undoViewProps: UndoViewProps
}

export const renderChildNodesBase = createRenderChildNodes({
  attachment: ExamAttachment,
  'attachment-link': mkAttachmentLink('link'),
  'attachment-links': mkAttachmentLinks('link'),
  audio: Audio,
  'audio-title': RenderChildNodes,
  'audio-group': AudioGroup,
  'audio-test': AudioTest,
  'choice-answer': ChoiceAnswer,
  'dnd-answer-container': DNDAnswerContainer,
  'dropdown-answer': DropdownAnswer,
  'exam-footer': ExamFooter,
  'external-material': ExternalMaterial,
  file: File,
  formula: Formula,
  image: Image,
  question: Question,
  'question-number': QuestionNumber,
  translation: ExamTranslation,
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
  'audio-answer': AudioAnswer
})

const Exam: React.FunctionComponent<ExamProps & AnnotationProps> = ({
  doc,
  casStatus,
  answers,
  restrictedAudioPlaybackStats,
  examServerApi,
  studentName,
  showUndoView,
  undoViewProps,
  annotationsEnabled,
  renderComponentOverrides = {}
}) => {
  const { date, dateTimeFormatter, dayCode, examCode, language, resolveAttachment, root, subjectLanguage } =
    useContext(CommonExamContext)
  const renderChildNodes = useMemo(() => renderChildNodesBase(renderComponentOverrides), [renderComponentOverrides])

  const examTitle = findChildElement(root, 'exam-title')
  const examInstruction = findChildElement(root, 'exam-instruction')
  const tableOfContents = findChildElement(root, 'table-of-contents')
  const externalMaterial = findChildElement(root, 'external-material')
  const examStylesheet = root.getAttribute('exam-stylesheet')

  const examRef = createRef<HTMLDivElement>()

  const store = useCached(() =>
    initializeExamStore(parseExamStructure(doc), casStatus, answers, restrictedAudioPlaybackStats, examServerApi)
  )

  const TableOfContentsSidebar = useCached(() =>
    mkTableOfContents({
      showAttachmentLinks: true,
      showAnsweringInstructions: true,
      isInSidebar: true
    })
  )

  const TableOfContents = useCached(() =>
    mkTableOfContents({
      showAttachmentLinks: true,
      showAnsweringInstructions: true,
      isInSidebar: false
    })
  )

  const i18n = useCached(() => initI18n(language, examCode, dayCode))

  useEffect(changeLanguage(i18n, language))
  useEffect(scrollToHash, [])

  const [allRefs, setAllRefs] = useState<HTMLDivElement[]>([])

  const addRef = (ref: HTMLDivElement) => {
    if (!allRefs.includes(ref)) {
      setAllRefs(prevRefs => {
        const nextAllRefs = [...prevRefs, ref]
        return nextAllRefs
      })
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(callback)
    const observableElements = allRefs
    observableElements.forEach(element => observer.observe(element))
    return () => {
      observableElements.forEach(element => observer.unobserve(element))
    }
  }, [allRefs])

  const callback = (entries: IntersectionObserverEntry[]) =>
    entries.forEach(entry => {
      const dataTOCId = entry.target.getAttribute('data-toc-id')!
      setVisibleElements(prevEntries =>
        entry.isIntersecting ? [...prevEntries, dataTOCId] : prevEntries.filter(entries => entries !== dataTOCId)
      )
    })

  const [visibleElements, setVisibleElements] = useState<string[]>([])

  const isInViewport = (element: Element) => {
    const offset = 100 // must be at least this far away from viewport edges
    const rect = element.getBoundingClientRect()
    return rect.top >= offset && rect.bottom <= window.innerHeight - offset
  }

  useEffect(() => {
    visibleElements.forEach(element => {
      const displayNumber = element.replace('question-', '')
      const naviQuestionTitle = document.querySelector(`.table-of-contents li[data-list-number="${displayNumber}."]`)
      if (naviQuestionTitle) {
        const isVisible = isInViewport(naviQuestionTitle)
        const sideNavigation = document.querySelector(`.sidebar-toc-container .table-of-contents`)
        if (!isVisible && !!sideNavigation) {
          const navHeight = sideNavigation.getBoundingClientRect().height
          const scrollToPos = (naviQuestionTitle as HTMLElement).offsetTop - navHeight / 2
          sideNavigation.scrollTo({ behavior: 'smooth', top: scrollToPos })
        }
      }
    })
  }, [visibleElements])

  // TODO: Remove 'isNewKoeVersion' checks when old Koe version is not supported anymore
  // Here "old" means versions where student can not examine answers on a separate page after answering questions
  const isNewKoeVersion = examServerApi.examineExam !== undefined
  const isPreview = studentName === '[Kokelaan Nimi]'

  return (
    <Provider store={store}>
      <AnnotationProvider annotationsEnabled={annotationsEnabled}>
        <TOCContext.Provider
          value={{
            visibleTOCElements: visibleElements,
            addRef
          }}
        >
          <I18nextProvider i18n={i18n}>
            <main className="e-exam" lang={subjectLanguage} aria-labelledby={examTitleId} ref={examRef}>
              <React.StrictMode />
              {examStylesheet && <link rel="stylesheet" href={resolveAttachment(examStylesheet)} />}
              <div className="e-toc-and-exam">
                {tableOfContents && (
                  <div className="sidebar-toc-container" aria-hidden="true">
                    <TableOfContentsSidebar
                      {...{ element: tableOfContents, renderChildNodes, renderComponentOverrides }}
                    />
                  </div>
                )}

                <div className="main-exam-container">
                  <div className="main-exam">
                    <StudentNameHeader studentName={studentName} />

                    <SectionElement aria-labelledby={examTitleId}>
                      {examTitle && <DocumentTitle id={examTitleId}>{renderChildNodes(examTitle)}</DocumentTitle>}
                      {date && (
                        <p>
                          <strong>{dateTimeFormatter.format(date)}</strong>
                        </p>
                      )}

                      <NoAttachmentsNotification root={root} />

                      {examInstruction && (
                        <ExamInstruction
                          {...{ element: examInstruction, renderChildNodes, renderComponentOverrides }}
                        />
                      )}

                      {tableOfContents && (
                        <div className="main-toc-container">
                          <TableOfContents
                            {...{
                              element: tableOfContents,
                              renderChildNodes,
                              renderComponentOverrides
                            }}
                          />
                        </div>
                      )}
                      {externalMaterial && (
                        <ExternalMaterial
                          {...{
                            element: externalMaterial,
                            renderChildNodes,
                            renderComponentOverrides,
                            forceRender: true
                          }}
                        />
                      )}
                    </SectionElement>

                    {renderChildNodes(root)}

                    {(isPreview || isNewKoeVersion) && (
                      <div className="e-examine-exam">
                        <GoToExamineAnswersButton />
                        <ProceedToExamineAnswersText />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {(isPreview || isNewKoeVersion) && (
                <Footer>
                  <div className="e-footer-version-number-container">
                    <VersionNumber />
                  </div>
                </Footer>
              )}

              <ErrorIndicator />
              <SaveIndicator />

              {showUndoView && isNewKoeVersion && <UndoView {...undoViewProps} />}
            </main>
          </I18nextProvider>
        </TOCContext.Provider>
      </AnnotationProvider>
    </Provider>
  )
}

const NoAttachmentsNotification = ({ root }: { root: Element }) => {
  const { t } = useExamTranslation()
  const hasAttachments = query(root, 'external-material')
  return hasAttachments ? null : (
    <span className="notification notification--inline">
      <NotificationIcon />
      {t('no-attachments')}
    </span>
  )
}

const ProceedToExamineAnswersText = () => {
  const { t } = useExamTranslation()
  return (
    <div className="e-examine-exam-instructions" id="examineExamInstructions">
      {t('examine-exam.instructions')}
    </div>
  )
}

export default React.memo(withExamContext(withCommonExamContext(withAudioRecorderContext(Exam))))
