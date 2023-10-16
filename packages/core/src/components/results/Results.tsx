import React, { useContext, useEffect } from 'react'
import { I18nextProvider, useTranslation } from 'react-i18next'
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
import { useIsFinishExamPage } from './isExamFinishPageHook'
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

  const examTitle = findChildElement(root, 'exam-title')
  const examStylesheet = root.getAttribute('exam-stylesheet')

  const i18n = useCached(() => initI18n(language, examCode, dayCode))
  useEffect(changeLanguage(i18n, language))
  useEffect(scrollToHash, [])
  const { t } = useTranslation()
  const isFinishExamPage = useIsFinishExamPage()

  return (
    <I18nextProvider i18n={i18n}>
      <main className={classNames('e-exam e-results', { 'finish-exam-page': isFinishExamPage })} lang={subjectLanguage}>
        <React.StrictMode />
        {examStylesheet && <link rel="stylesheet" href={resolveAttachment(examStylesheet)} />}
        {isFinishExamPage && (
          <button className="k-exam-done-return js-exam-done-return" onClick={() => returnToExam()}>
            Palaa kokeeseen
          </button>
        )}
        <div className="e-columns e-columns--bottom-v e-mrg-b-4">
          {examTitle && (
            <DocumentTitle id="title" className="e-column e-mrg-b-0">
              {renderChildNodes(examTitle)}
              {date && `, ${dateTimeFormatter.format(date)}`}
            </DocumentTitle>
          )}
          {!isFinishExamPage && <ScoresAndFinalGrade />}
        </div>

        {isFinishExamPage && (
          <div className="finish-page-instructions">
            <p>Näet tässä vastauksesi samanlaisina kuin kokeen arvostelijat tulevat ne näkemään.</p>
            <ul>
              <li>
                Tarkista, että näet alla kaikki koesuoritukset, jotka haluat jättää arvosteltavaksi.
                <br />
              </li>
              <li>Jos näet ylimääräisiä koesuorituksia, palaa kokeeseen ja poista ne.</li>
            </ul>
          </div>
        )}

        <ErrorIndicatorForErrors
          validationErrors={validateAnswers(parseExamStructure(doc), answersByQuestionId)}
          inExam={false}
        />
        {renderChildNodes(root)}

        {isFinishExamPage && (
          <div>
            <p className="k-exam-done-instructions">
              Kun olet valmis, sammuta tietokoneesi oikeasta yläkulmasta.
              <br />
              Kun kone on sammunut, irrota USB-muisti ja palauta se kokeen valvojalle.
            </p>
            <img
              className="k-exam-done-shutdown-image"
              src="/dist/digabi-shutdown-screenshot.png"
              alt={t('examFinished.shutdownTooltip')!}
            />
          </div>
        )}
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
