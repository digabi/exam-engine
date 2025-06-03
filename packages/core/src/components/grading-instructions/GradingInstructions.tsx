import React, { useContext, useEffect, useMemo } from 'react'
import { I18nextProvider } from 'react-i18next'
import { createRenderChildNodes } from '../../createRenderChildNodes'
import { findChildElement, queryAncestors } from '../../dom-utils'
import { changeLanguage, initI18n, useExamTranslation } from '../../i18n'
import { examTitleId } from '../../ids'
import { scrollToHash } from '../../scrollToHash'
import { useCached } from '../../useCached'
import DocumentTitle from '../DocumentTitle'
import RenderExamElements from '../RenderExamElements'
import { renderIf } from '../RenderIf'
import SectionElement from '../SectionElement'
import { AnnotationProvider } from '../context/AnnotationProvider'
import { CommonExamContext, withCommonExamContext } from '../context/CommonExamContext'
import { AnnotationProps, CommonExamProps } from '../exam/Exam'
import QuestionInstruction from '../exam/QuestionInstruction'
import mkAttachmentLink from '../shared/AttachmentLink'
import mkAttachmentLinks from '../shared/AttachmentLinks'
import ExamTranslation from '../shared/ExamTranslation'
import File from '../shared/File'
import Formula from '../shared/Formula'
import Image from '../shared/Image'
import { QuestionNumber } from '../shared/QuestionNumber'
import { mkTableOfContents } from '../shared/TableOfContents'
import AnswerGradingInstruction from './AnswerGradingInstruction'
import AutogradedAnswer from './AutogradedAnswer'
import AutogradedAnswerOption from './AutogradedAnswerOption'
import ExamGradingInstruction from './ExamGradingInstruction'
import Question from './Question'
import QuestionTitle from './QuestionTitle'
import Recording from './Recording'
import Section from './Section'
import SectionTitle from './SectionTitle'
import { GradingInstructionProvider } from './GradingInstructionProvider'
import { GradingInstructionProps } from '../context/GradingInstructionContext'
import { DNDAnswerContainer } from '../shared/DNDAnswerContainer'
import RenderAttachmentElements from './RenderAttachmentElements'
import { gradingInstructionContent } from './gradingInstructionContent'

const RenderIfWithinGradingInstructionContent = renderIf(
  element => queryAncestors(element, gradingInstructionContent) != null
)

const RenderIfNotWithinExternalMaterial = renderIf(element => queryAncestors(element, ['external-material']) == null)

const _renderChildNodes = createRenderChildNodes({
  'accepted-answer': AutogradedAnswerOption,
  attachment: RenderAttachmentElements,
  'attachment-link': { component: mkAttachmentLink('plain'), wrapper: RenderIfNotWithinExternalMaterial },
  'attachment-links': { component: mkAttachmentLinks('plain'), wrapper: RenderIfNotWithinExternalMaterial },
  audio: Recording,
  'audio-group': RenderExamElements,
  'choice-answer': AutogradedAnswer,
  'choice-answer-option': AutogradedAnswerOption,
  'dropdown-answer': AutogradedAnswer,
  'dropdown-answer-option': AutogradedAnswerOption,
  'dnd-answer-container': props => <DNDAnswerContainer {...props} page="grading-instructions" />,
  'external-material': RenderExamElements,
  file: { component: File, wrapper: RenderIfWithinGradingInstructionContent },
  formula: { component: Formula, wrapper: RenderIfWithinGradingInstructionContent },
  hints: RenderExamElements,
  image: { component: Image, wrapper: RenderIfWithinGradingInstructionContent },
  question: Question,
  'question-title': QuestionTitle,
  'question-instruction': QuestionInstruction,
  'question-grading-instruction': AnswerGradingInstruction,
  'question-number': QuestionNumber,
  translation: ExamTranslation,
  'scored-text-answer': AutogradedAnswer,
  'text-answer': AutogradedAnswer,
  section: Section,
  'section-title': SectionTitle,
  video: Recording
})

const GradingInstructions: React.FunctionComponent<CommonExamProps & AnnotationProps & GradingInstructionProps> = ({
  doc,
  EditorComponent,
  annotationsEnabled,
  renderComponentOverrides = {}
}) => {
  const root = doc.documentElement
  const { date, dateTimeFormatter, dayCode, examCode, language, subjectLanguage } = useContext(CommonExamContext)
  const renderChildNodes = useMemo(() => _renderChildNodes(renderComponentOverrides), [renderComponentOverrides])

  const examTitle = findChildElement(root, 'exam-title')
  const examGradingInstruction = findChildElement(root, 'exam-grading-instruction')
  const tableOfContents = findChildElement(root, 'table-of-contents')
  const TableOfContents = mkTableOfContents({
    showAnsweringInstructions: false,
    showAttachmentLinks: false,
    isInSidebar: false
  })

  const i18n = useCached(() => initI18n(language, examCode, dayCode))
  useEffect(changeLanguage(i18n, language))

  useEffect(scrollToHash, [])

  return (
    <AnnotationProvider annotationsEnabled={annotationsEnabled}>
      <GradingInstructionProvider EditorComponent={EditorComponent}>
        <I18nextProvider i18n={i18n}>
          <main className="e-exam e-grading-instructions" lang={subjectLanguage}>
            <React.StrictMode />
            <SectionElement aria-labelledby={examTitleId}>
              <DocumentTitle id={examTitleId}>
                <GradingInstructionsPageTitle /> {examTitle && renderChildNodes(examTitle)}
              </DocumentTitle>
              {date && (
                <p>
                  <strong>{dateTimeFormatter.format(date)}</strong>
                </p>
              )}
              {examGradingInstruction && (
                <ExamGradingInstruction
                  {...{ element: examGradingInstruction, renderChildNodes, renderComponentOverrides }}
                />
              )}
              {tableOfContents && (
                <div className="main-toc-container">
                  <TableOfContents {...{ element: tableOfContents, renderChildNodes, renderComponentOverrides }} />
                </div>
              )}
            </SectionElement>
            {renderChildNodes(root)}
          </main>
        </I18nextProvider>
      </GradingInstructionProvider>
    </AnnotationProvider>
  )
}

// Wrap to a separate component, since we can't use translation hooks in the root component.
export const GradingInstructionsPageTitle: React.FunctionComponent = () => {
  const { t } = useExamTranslation()
  return <>{t('grading-instructions-page-title')}</>
}

export default React.memo(withCommonExamContext(GradingInstructions))
