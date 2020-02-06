import { GradingStructure } from '@digabi/exam-engine-mastering'
import React, { useContext, useEffect } from 'react'
import { I18nextProvider, useTranslation } from 'react-i18next'
import { createRenderChildNodes } from '../../createRenderChildNodes'
import { findChildElement } from '../../dom-utils'
import { initI18n } from '../../i18n'
import { scrollToHash } from '../../scrollToHash'
import { CommonExamContext, withCommonExamContext } from '../CommonExamContext'
import DocumentTitle from '../DocumentTitle'
import { CommonExamProps } from '../Exam'
import ExamAttachment from '../ExamAttachment'
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

export interface ResultsProps extends CommonExamProps {
  /** Contains grading structure for the exam, and in addition scores and metadata (comments and annotations) */
  gradingStructure: GradingStructure
  /** Custom grading text to be displayed for the whole exam. For example total grade for the exam. */
  gradingText?: string
  /** Scores for exam questions */
  scores: AnswerScore[]
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
  'scored-text-answers': Hints,
  section: ResultsExamSection,
  'section-title': ExamSectionTitle,
  'text-answer': ResultsTextAnswer,
  'scored-text-answer': ResultsTextAnswer
})

function Results({}: ResultsProps) {
  const { language, root } = useContext(CommonExamContext)

  const examTitle = findChildElement(root, 'exam-title')
  const examStylesheet = root.getAttribute('exam-stylesheet')

  const i18n = initI18n(language, root.getAttribute('exam-code'), root.getAttribute('day-code'))
  useEffect(scrollToHash, [])

  return (
    <I18nextProvider i18n={i18n}>
      <CommonExamContext.Consumer>
        {({ date, dateTimeFormatter, resolveAttachment }) => (
          <main className="e-exam" lang={language}>
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
      </CommonExamContext.Consumer>
    </I18nextProvider>
  )
}

function ScoresAndFinalGrade() {
  const { gradingText, totalScore } = useContext(ResultsContext)
  const { t } = useTranslation()

  return (
    <div>
      <span className="e-column">
        {t('exam-total')}
        {':'}
      </span>
      <strong className="e-column e-column--narrow table-of-contents--score-column">
        {t('points', { count: totalScore })}
      </strong>
      {gradingText && (
        <div>
          <span className="e-column">{t('grade')}</span>
          <strong className="e-column e-column--narrow table-of-contents--score-column">{gradingText}</strong>
        </div>
      )}
    </div>
  )
}

export default React.memo(withResultsContext(withCommonExamContext(Results)))
