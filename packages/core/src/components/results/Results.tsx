import React, { useContext, useEffect, useState } from 'react'
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
import { useIsStudentsFinishExamPage } from './isExamFinishPageHook'
import classNames from 'classnames'

export interface ResultsProps extends CommonExamProps {
  /** Contains grading structure for the exam, and in addition scores and metadata (comments and annotations) */
  gradingStructure: GradingStructure
  /** Custom grading text to be displayed for the whole exam. For example total grade for the exam. */
  gradingText?: string
  /** Scores for exam answers */
  scores: Score[]
  singleGrading?: boolean
  returnToExam: () => void
}

const renderChildNodes = createRenderChildNodes({
  attachment: RenderChildNodes,
  'attachment-link': mkAttachmentLink('plain'),
  'attachment-links': mkAttachmentLinks('plain'),
  'audio-group': RenderChildNodes,
  'choice-answer': ResultsChoiceAnswer,
  'dropdown-answer': DropdownAnswer,
  formula: Formula,
  question: Question,
  hints: RenderChildNodes,
  image: renderIf(({ element }) => queryAncestors(element, 'choice-answer') != null)(Image),
  'question-instruction': ExamQuestionInstruction,
  'question-number': QuestionNumber,
  translation: ExamTranslation,
  'question-title': QuestionTitle,
  section: Section,
  'section-title': ExamSectionTitle,
  'text-answer': TextAnswer,
  'scored-text-answer': ScoredTextAnswer,
  'scored-text-answers': RenderChildNodes
})

const Results: React.FunctionComponent<ResultsProps> = ({ doc, returnToExam }) => {
  const { date, dateTimeFormatter, dayCode, examCode, language, resolveAttachment, root, subjectLanguage } =
    useContext(CommonExamContext)
  const { answersByQuestionId } = useContext(ResultsContext)
  const [examEnded, setExamEnded] = useState<boolean>(false)

  const examTitle = findChildElement(root, 'exam-title')
  const examStylesheet = root.getAttribute('exam-stylesheet')

  const i18n = useCached(() => initI18n(language, examCode, dayCode))
  useEffect(changeLanguage(i18n, language))
  useEffect(scrollToHash, [])
  const isStudentsFinishExamPage = useIsStudentsFinishExamPage()

  useEffect(() => {
    window.location.hash = ''
  }, [])

  const endExam = () => {
    setExamEnded(true)
    const sections = document.querySelectorAll('.e-section')
    sections.forEach(section => {
      const sec = section as HTMLElement
      const sectionHeight = section.clientHeight
      sec.style.height = `${sectionHeight}px`
      section.classList.add('e-hidden')
      setTimeout(() => {
        sec.style.height = '0px'
        sec.style.paddingTop = '1rem'
      }, 250)
    })
  }

  return (
    <I18nextProvider i18n={i18n}>
      <main
        className={classNames('e-exam e-results', { 'finish-exam-page': isStudentsFinishExamPage })}
        lang={subjectLanguage}
      >
        <React.StrictMode />
        {examStylesheet && <link rel="stylesheet" href={resolveAttachment(examStylesheet)} />}

        {isStudentsFinishExamPage && (
          <button className="e-exam-done-return js-exam-done-return" onClick={returnToExam}>
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
          {!isStudentsFinishExamPage && <ScoresAndFinalGrade />}
        </div>

        {isStudentsFinishExamPage && <FinishPageInstructions />}

        <ErrorIndicatorForErrors
          validationErrors={validateAnswers(parseExamStructure(doc), answersByQuestionId)}
          inExam={false}
        />
        {renderChildNodes(root)}

        {isStudentsFinishExamPage && <ShutdownInstructions />}
        {!isStudentsFinishExamPage && (
          <div className="e-logout-container">
            <div className="e-bg-color-off-white e-pad-6 ">
              <p>
                {examEnded ? (
                  'Kiitos! Sammuta vielä tietokoneesi'
                ) : (
                  <>
                    Kun olet tarkistanut vastauksesi, päätä koe klikkaamalla alla olevaa nappia. <br />
                    Napin klikkaamisen jälkeen et voi enää palata kokeeseen.
                  </>
                )}
              </p>
              {!examEnded && (
                <button className="e-button" onClick={endExam}>
                  Päätä koe
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </I18nextProvider>
  )
}

const BackToExamText = () => {
  const { t } = useExamTranslation()
  return t('examFinished.returnToExam')
}

const FinishPageInstructions = () => {
  const { t } = useExamTranslation()
  return (
    <div className="finish-page-instructions">
      <p>{t('examFinished.hereAreYourAnswers')}</p>
      <ul>
        <li>{t('examFinished.checkYourAnswers')}</li>
        <li>{t('examFinished.removeExcessAnswers')}</li>
        <li>
          <span className="no-answer-example">{t('examFinished.emptyAnswersAreHighlighted')}</span>
          {t('examFinished.thereMayBeOptionalQuestions')}
        </li>
      </ul>
    </div>
  )
}

const ShutdownInstructions = () => {
  const { t, i18n } = useExamTranslation()
  return (
    <div className="e-exam-done-instructions">
      <p>{t('examFinished.shutdownInstructions')}</p>
      <img
        className="e-exam-done-shutdown-image"
        src="/dist/digabi-shutdown-screenshot.png"
        alt={i18n.t('examFinished.shutdownTooltip')}
      />
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
