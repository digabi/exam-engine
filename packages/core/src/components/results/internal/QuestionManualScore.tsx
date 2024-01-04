import classNames from 'classnames'
import React, { useContext } from 'react'
import { CensoringScore, InspectionScore, PregradingScore, Score } from '../../../index'
import { useExamTranslation } from '../../../i18n'
import { QuestionContext } from '../../context/QuestionContext'
import ResultsExamQuestionScoresContainer from './QuestionScoresContainer'

export interface QuestionManualScoreProps {
  scores?: Score
  maxScore?: number
  displayNumber?: string
  multilineAnswer?: boolean
  questionId: number
}

interface NormalizedScore {
  score: number
  shortCode: string
  type:
    | 'grading.pregrading-abbrev'
    | 'grading.round.1'
    | 'grading.round.2'
    | 'grading.round.3'
    | 'grading.inspection-grading-abbrev'
}

function QuestionManualScore({
  scores,
  maxScore,
  displayNumber,
  multilineAnswer,
  questionId
}: QuestionManualScoreProps) {
  const { answers } = useContext(QuestionContext)
  const containerProps = { answers, displayNumber, multilineAnswer, questionId }
  const shortCode = scores?.censoring?.nonAnswerDetails?.shortCode
  return (
    <ResultsExamQuestionScoresContainer {...containerProps}>
      {scores?.pregrading?.score == null && !scores?.censoring?.scores?.length ? (
        <NoPregrading {...{ maxScore }} />
      ) : (
        <>
          {renderNormalizedScores(scores, maxScore)}
          {shortCode && <NonAnswer shortCode={shortCode} />}
        </>
      )}
    </ResultsExamQuestionScoresContainer>
  )
}

function renderNormalizedScores(scores: Score, maxScore?: number) {
  const normalizedScores = [
    scores.inspection && normalizeInspectionScore(scores.inspection),
    ...(scores.censoring ? normalizeCensoringScores(scores.censoring) : []),
    scores.pregrading && normalizePregradingScore(scores.pregrading)
  ].filter(Boolean) as NormalizedScore[]

  return normalizedScores.map((score, i) => <ScoreRow key={i} {...score} latest={i === 0} maxScore={maxScore} />)
}

interface NoPregradingProps {
  maxScore?: number
}

function NoPregrading({ maxScore }: NoPregradingProps) {
  const { t } = useExamTranslation()
  return (
    <>
      <span className="e-result-scorecount-empty" />
      {maxScore && ` / ${maxScore} `}
      {t('points', { count: '' as any as number })}
    </>
  )
}

interface NonAnswerProps {
  shortCode: string
}

function NonAnswer({ shortCode }: NonAnswerProps) {
  return (
    <div className="e-color-darkgrey e-columns e-columns--center-v">
      <span className="e-font-size-xxxl e-light e-mrg-r-1">×</span>
      <span>{shortCode}</span>
    </div>
  )
}

interface ScoreRowProps {
  maxScore?: number
  latest: boolean
}

function ScoreRow({ score, shortCode, type, maxScore, latest }: ScoreRowProps & NormalizedScore) {
  const { t } = useExamTranslation()

  return (
    <div className={latest ? 'e-color-black' : 'e-color-darkgrey e-font-size-xs'}>
      <ScoreColumn className={classNames('e-nowrap', { 'e-font-size-m': latest })}>
        {latest ? <b>{score}</b> : score}
        {latest && maxScore ? ` / ${maxScore}` : ''}
        {` p.`}
      </ScoreColumn>
      <ScoreColumn className="e-result-scorecount-shortcode">{shortCode}</ScoreColumn>
      <ScoreColumn className="e-mrg-r-0">{t(type)}</ScoreColumn>
    </div>
  )
}

interface ScoreColumnProps {
  children?: React.ReactNode
  className?: string
}

function ScoreColumn({ className, children }: ScoreColumnProps) {
  return <span className={classNames('e-mrg-r-1 e-nowrap', className)}>{children}</span>
}

function normalizePregradingScore({ score }: PregradingScore): NormalizedScore | null {
  return score !== undefined ? { score, shortCode: '', type: 'grading.pregrading-abbrev' } : null
}

function normalizeCensoringScores(score: CensoringScore): NormalizedScore[] {
  return score.scores.map((s, i) => ({
    score: s.score,
    shortCode: s.shortCode || '',
    type: `grading.round.${score.scores.length - i}` as NormalizedScore['type']
  }))
}

function normalizeInspectionScore(score: InspectionScore): NormalizedScore {
  return {
    score: score.score,
    shortCode: score.shortCodes ? score.shortCodes.join(', ') : '',
    type: 'grading.inspection-grading-abbrev'
  }
}

export default React.memo(QuestionManualScore)
