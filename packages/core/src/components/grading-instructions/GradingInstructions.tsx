import React, { useContext, useEffect } from 'react'
import { AnnotationProps, CommonExamProps } from '../exam/Exam'
import { CommonExamContext, withCommonExamContext } from '../context/CommonExamContext'
import { useCached } from '../../useCached'
import { changeLanguage, initI18n, useExamTranslation } from '../../i18n'
import { scrollToHash } from '../../scrollToHash'
import { I18nextProvider } from 'react-i18next'
import Section from './Section'
import SectionTitle from './SectionTitle'
import Question from './Question'
import File from '../shared/File'
import ExamGradingInstruction from './ExamGradingInstruction'
import AutogradedAnswer from './AutogradedAnswer'
import Image from '../shared/Image'
import Formula from '../shared/Formula'
import AutogradedAnswerOption from './AutogradedAnswerOption'
import QuestionTitle from './QuestionTitle'
import { createRenderChildNodes } from '../../createRenderChildNodes'
import { examTitleId } from '../../ids'
import DocumentTitle from '../DocumentTitle'
import SectionElement from '../SectionElement'
import { findChildElement, queryAncestors } from '../../dom-utils'
import { renderIf } from '../RenderIf'
import RenderExamElements from '../RenderExamElements'
import { mkTableOfContents } from '../shared/TableOfContents'
import AnswerGradingInstruction from './AnswerGradingInstruction'
import mkAttachmentLink from '../shared/AttachmentLink'
import mkAttachmentLinks from '../shared/AttachmentLinks'
import Recording from './Recording'
import QuestionInstruction from '../exam/QuestionInstruction'
import { QuestionNumber } from '../shared/QuestionNumber'
import ExamTranslation from '../shared/ExamTranslation'
import { AnnotationProvider } from '../context/AnnotationProvider'

const renderIfWithinGradingInstructionContent = renderIf(
  ({ element }) =>
    queryAncestors(element, [
      // Keep in sync with lists in mastering/index.ts
      'answer-grading-instruction',
      'choice-answer-option',
      'dropdown-answer-option',
      'exam-grading-instruction',
      'question-grading-instruction',
      'hint',
      'question-title',
      'question-instruction'
    ]) != null
)

const renderIfNotWithinExternalMaterial = renderIf(
  ({ element }) => queryAncestors(element, ['external-material']) == null
)

const renderChildNodes = createRenderChildNodes({
  'accepted-answer': AutogradedAnswerOption,
  attachment: RenderExamElements,
  'attachment-link': renderIfNotWithinExternalMaterial(mkAttachmentLink('plain')),
  'attachment-links': renderIfNotWithinExternalMaterial(mkAttachmentLinks('plain')),
  audio: Recording,
  'audio-group': RenderExamElements,
  'choice-answer': AutogradedAnswer,
  'choice-answer-option': AutogradedAnswerOption,
  'dropdown-answer': AutogradedAnswer,
  'dropdown-answer-option': AutogradedAnswerOption,
  'external-material': RenderExamElements,
  file: renderIfWithinGradingInstructionContent(File),
  formula: renderIfWithinGradingInstructionContent(Formula),
  hints: RenderExamElements,
  image: renderIfWithinGradingInstructionContent(Image),
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

const GradingInstructions: React.FunctionComponent<CommonExamProps & AnnotationProps> = ({
  doc,
  annotations,
  onClickAnnotation,
  onSaveAnnotation
}) => {
  const root = doc.documentElement
  const { date, dateTimeFormatter, dayCode, examCode, language, subjectLanguage } = useContext(CommonExamContext)

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
    <AnnotationProvider
      annotations={annotations}
      onClickAnnotation={onClickAnnotation}
      onSaveAnnotation={onSaveAnnotation}
    >
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
              <ExamGradingInstruction {...{ element: examGradingInstruction, renderChildNodes }} />
            )}
            {tableOfContents && <TableOfContents {...{ element: tableOfContents, renderChildNodes }} />}
          </SectionElement>
          {renderChildNodes(root)}
        </main>
      </I18nextProvider>
    </AnnotationProvider>
  )
}

// Wrap to a separate component, since we can't use translation hooks in the root component.
export const GradingInstructionsPageTitle: React.FunctionComponent = () => {
  const { t } = useExamTranslation()
  return <>{t('grading-instructions-page-title')}</>
}

export default React.memo(withCommonExamContext(GradingInstructions))
