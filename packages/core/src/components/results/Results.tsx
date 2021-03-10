import React, { useContext, useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'
import { GradingStructure, Score } from '../..'
import { createRenderChildNodes } from '../../createRenderChildNodes'
import { findChildElement, queryAncestors } from '../../dom-utils'
import { changeLanguage, initI18n, useExamTranslation } from '../../i18n'
import { scrollToHash } from '../../scrollToHash'
import { useCached } from '../../useCached'
import mkAttachmentLink from '../AttachmentLink'
import mkAttachmentLinks from '../AttachmentLinks'
import { CommonExamContext, withCommonExamContext } from '../CommonExamContext'
import DocumentTitle from '../DocumentTitle'
import { CommonExamProps } from '../Exam'
import ExamQuestionInstruction from '../ExamQuestionInstruction'
import ExamSectionTitle from '../ExamSectionTitle'
import Formula from '../Formula'
import Image from '../Image'
import RenderChildNodes from '../RenderChildNodes'
import { renderIf } from '../RenderIf'
import ResultsChoiceAnswer from './ResultsChoiceAnswer'
import { ResultsContext, withResultsContext } from './ResultsContext'
import ResultsDropdownAnswer from './ResultsDropdownAnswer'
import ResultsExamQuestion from './ResultsExamQuestion'
import ResultsExamQuestionTitle from './ResultsExamQuestionTitle'
import ResultsExamSection from './ResultsExamSection'
import ResultsScoredTextAnswer from './ResultsScoredTextAnswer'
import ResultsTextAnswer from './ResultsTextAnswer'

export interface ResultsProps extends CommonExamProps {
  /** Contains grading structure for the exam, and in addition scores and metadata (comments and annotations) */
  gradingStructure: GradingStructure
  /** Custom grading text to be displayed for the whole exam. For example total grade for the exam. */
  gradingText?: string
  /** Scores for exam answers */
  scores: Score[]
  singleGrading?: boolean
}

const renderChildNodes = createRenderChildNodes({
  attachment: RenderChildNodes,
  'attachment-link': mkAttachmentLink('plain'),
  'attachment-links': mkAttachmentLinks('plain'),
  'audio-group': RenderChildNodes,
  'choice-answer': ResultsChoiceAnswer,
  'dropdown-answer': ResultsDropdownAnswer,
  formula: Formula,
  question: ResultsExamQuestion,
  hints: RenderChildNodes,
  image: renderIf(({ element }) => queryAncestors(element, 'choice-answer') != null)(Image),
  'question-instruction': ExamQuestionInstruction,
  'question-title': ResultsExamQuestionTitle,
  section: ResultsExamSection,
  'section-title': ExamSectionTitle,
  'text-answer': ResultsTextAnswer,
  'scored-text-answer': ResultsScoredTextAnswer,
  'scored-text-answers': RenderChildNodes,
})

const Results: React.FunctionComponent<ResultsProps> = () => {
  const { date, dateTimeFormatter, language, resolveAttachment, root, subjectLanguage } = useContext(CommonExamContext)

  const examTitle = findChildElement(root, 'exam-title')
  const examStylesheet = root.getAttribute('exam-stylesheet')

  const examCode = root.getAttribute('exam-code')
  const dayCode = root.getAttribute('day-code')
  const i18n = useCached(() => initI18n(language, examCode, dayCode))
  useEffect(changeLanguage(i18n, language))

  useEffect(scrollToHash, [])

  return (
    <I18nextProvider i18n={i18n}>
      <main className="e-exam" lang={subjectLanguage}>
        <React.StrictMode />
        {examStylesheet && <link rel="stylesheet" href={resolveAttachment(examStylesheet)} />}
        <div className="e-columns e-columns--bottom-v e-mrg-b-4">
          {examTitle && (
            <DocumentTitle id="title" className="e-column e-mrg-b-0">
              {renderChildNodes(examTitle)}
              {date && ', ' + dateTimeFormatter.format(date)}
            </DocumentTitle>
          )}
          <ScoresAndFinalGrade />
        </div>
        {renderChildNodes(root)}
      </main>
    </I18nextProvider>
  )
}

function ScoresAndFinalGrade() {
  const { gradingText, totalScore } = useContext(ResultsContext)
  const { t } = useExamTranslation()

  return (
    <div className="e-column--narrow">
      <table className="e-table e-table--borderless e-mrg-b-0">
        <tbody>
          <tr>
            <th className="e-pad-y-0 e-normal">{t('grading-total')}</th>
            <td className="e-pad-y-0 e-semibold e-text-right">{t('points', { count: totalScore })}</td>
          </tr>
          {gradingText && (
            <tr>
              <th className="e-pad-y-0 e-normal">{t('grade')}</th>
              <td className="e-pad-y-0 e-semibold e-text-right">{gradingText}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default React.memo(withResultsContext(withCommonExamContext(Results)))
