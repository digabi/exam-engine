import React, { useContext, useEffect, useMemo } from 'react'
import { I18nextProvider } from 'react-i18next'
import { GradingStructure, Score } from '../..'
import { createRenderChildNodes } from '../../createRenderChildNodes'
import { findChildElement, queryAncestors } from '../../dom-utils'
import { changeLanguage, initI18n, useExamTranslation } from '../../i18n'
import { scrollToHash } from '../../scrollToHash'
import { useCached } from '../../useCached'
import mkAttachmentLink from '../shared/AttachmentLink'
import mkAttachmentLinks from '../shared/AttachmentLinks'
import { CommonExamContext, withCommonExamContext } from '../context/CommonExamContext'
import DocumentTitle from '../DocumentTitle'
import { CommonExamProps } from '../exam/Exam'
import ExamQuestionInstruction from '../exam/QuestionInstruction'
import ExamSectionTitle from '../exam/SectionTitle'
import Formula from '../shared/Formula'
import Image from '../shared/Image'
import RenderChildNodes from '../RenderChildNodes'
import { renderIf } from '../RenderIf'
import ResultsChoiceAnswer from './ChoiceAnswer'
import { ResultsContext, withResultsContext } from '../context/ResultsContext'
import DropdownAnswer from './DropdownAnswer'
import Question from './Question'
import QuestionTitle from './QuestionTitle'
import Section from './Section'
import ScoredTextAnswer from './ScoredTextAnswer'
import TextAnswer from './TextAnswer'
import { ErrorIndicatorForErrors } from '../exam/internal/ErrorIndicator'
import { validateAnswers } from '../../validateAnswers'
import { parseExamStructure } from '../../parser/parseExamStructure'
import { QuestionNumber } from '../shared/QuestionNumber'
import ExamTranslation from '../shared/ExamTranslation'
import { useIsStudentsExamineExamPage } from './isExamineExamPageHook'
import classNames from 'classnames'
import { EndExamSession } from './EndExamSession'
import { Footer } from '../shared/Footer'
import { DNDAnswerContainer } from '../shared/DNDAnswerContainer'
import { AudioContainer } from './AudioContainer'
import AudioAnswer from './AudioAnswer'

export interface ResultsProps extends CommonExamProps {
  /** Contains grading structure for the exam, and in addition scores and metadata (comments and annotations) */
  gradingStructure: GradingStructure
  /** Custom grading text to be displayed for the whole exam. For example total grade for the exam. */
  gradingText?: string
  /** Scores for exam answers */
  scores: Score[]
  singleGrading?: boolean
  returnToExam: () => void
  endSession: () => Promise<void>
  studentSessionEnded?: boolean
  isPreviewPage?: boolean
}

const _renderChildNodes = createRenderChildNodes({
  attachment: RenderChildNodes,
  'attachment-link': mkAttachmentLink('plain'),
  'attachment-links': mkAttachmentLinks('plain'),
  'audio-group': RenderChildNodes,
  audio: {
    component: AudioContainer,
    wrapper: renderIf(element => queryAncestors(element, 'dnd-answer-container') != null)
  },
  'choice-answer': ResultsChoiceAnswer,
  'dnd-answer-container': props => <DNDAnswerContainer {...props} page="results" />,
  'dropdown-answer': DropdownAnswer,
  formula: Formula,
  question: Question,
  hints: RenderChildNodes,
  image: {
    component: Image,
    wrapper: renderIf(element => queryAncestors(element, ['choice-answer', 'dnd-answer-container']) != null)
  },
  'question-instruction': ExamQuestionInstruction,
  'question-number': QuestionNumber,
  translation: ExamTranslation,
  'question-title': QuestionTitle,
  section: Section,
  'section-title': ExamSectionTitle,
  'text-answer': TextAnswer,
  'scored-text-answer': ScoredTextAnswer,
  'scored-text-answers': RenderChildNodes,
  'audio-answer': AudioAnswer
})

const Results: React.FunctionComponent<ResultsProps> = ({
  doc,
  returnToExam,
  endSession,
  studentSessionEnded = false,
  isPreviewPage,
  renderComponentOverrides
}) => {
  const { date, dateTimeFormatter, dayCode, examCode, language, resolveAttachment, root, subjectLanguage } =
    useContext(CommonExamContext)
  const { answersByQuestionId } = useContext(ResultsContext)
  const renderChildNodes = useMemo(() => _renderChildNodes(renderComponentOverrides), [renderComponentOverrides])

  const examTitle = findChildElement(root, 'exam-title')
  const examStylesheet = root.getAttribute('exam-stylesheet')

  const i18n = useCached(() => initI18n(language, examCode, dayCode))
  useEffect(changeLanguage(i18n, language))
  useEffect(scrollToHash, [])
  const isStudentsExamineExamPage = useIsStudentsExamineExamPage()
  const studentCanEndSession = endSession !== undefined

  const isExamCopy = !isStudentsExamineExamPage && !isPreviewPage

  useEffect(() => {
    window.location.hash = ''
  }, [])

  const onEndSession = () => {
    try {
      const elements = document.querySelectorAll('main > *:not(.e-logout-container)')
      elements.forEach(el => {
        const element = el as HTMLElement
        element.style.height = `${element.clientHeight}px`
      })
      setTimeout(() => {
        void endSession()
      }, 50)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <I18nextProvider i18n={i18n}>
      <main
        className={classNames('e-exam e-results', {
          'examine-exam-page': isStudentsExamineExamPage,
          'session-ended': studentSessionEnded
        })}
        lang={subjectLanguage}
      >
        <React.StrictMode />
        {examStylesheet && <link rel="stylesheet" href={resolveAttachment(examStylesheet)} />}

        {!isExamCopy && (
          <button className="e-exam-done-return js-exam-done-return e-button" onClick={returnToExam}>
            « <BackToExamText />
          </button>
        )}

        <div className="e-columns e-columns--bottom-v e-mrg-b-4">
          {examTitle && (
            <DocumentTitle id="title" className="e-column e-mrg-b-0">
              {renderChildNodes(examTitle)}
              {date && `, ${dateTimeFormatter.format(date)}`}
            </DocumentTitle>
          )}
          {!isStudentsExamineExamPage && <ScoresAndFinalGrade />}
        </div>

        {!isExamCopy && <ExamineExamInstructions />}

        <ErrorIndicatorForErrors
          validationErrors={validateAnswers(parseExamStructure(doc), answersByQuestionId)}
          inExam={false}
        />

        {renderChildNodes(root)}

        {(studentCanEndSession || isPreviewPage) && (
          <EndExamSession
            onEndSession={isStudentsExamineExamPage ? onEndSession : () => Promise.resolve()}
            sessionEnded={studentSessionEnded}
          />
        )}
      </main>
      <Footer />
    </I18nextProvider>
  )
}

const BackToExamText = () => {
  const { t } = useExamTranslation()
  return t('examineExam.returnToExam')
}

const ExamineExamInstructions = () => {
  const { t } = useExamTranslation()
  return (
    <div className="e-section examine-exam-page-instructions shadow-box">
      <h3>{t('examineExam.checkYourAnswersTitle')}</h3>
      <ul>
        <li>{t('examineExam.hereAreYourAnswers')}</li>
        <li>{t('examineExam.checkYourAnswers')}</li>
        <li>{t('examineExam.removeExcessAnswers')}</li>
        <li>
          <span className="no-answer-example">{t('examineExam.emptyAnswersAreHighlighted')}</span>
          {t('examineExam.thereMayBeOptionalQuestions')}
        </li>
      </ul>
    </div>
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
