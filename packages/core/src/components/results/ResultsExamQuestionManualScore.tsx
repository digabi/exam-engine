import classNames from 'classnames'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { CensoringScore, InspectionScore, PregradingScore, Score } from '../..'
import { QuestionContext } from '../QuestionContext'
import ResultsExamQuestionScoresContainer from './ResultsExamQuestionScoresContainer'

export interface ResultsExamQuestionManualScoreProps {
  scores?: Score
  maxScore?: number
  displayNumber?: string
  multilineAnswer?: boolean
}

interface NormalizedScore {
  score: number
  shortCode: string
  type: string
}

function ResultsExamQuestionManualScore({
  scores,
  maxScore,
  displayNumber,
  multilineAnswer,
}: ResultsExamQuestionManualScoreProps) {
  const { answers } = useContext(QuestionContext)
  const containerProps = { answers, displayNumber, multilineAnswer }
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
    scores.pregrading && normalizePregradingScore(scores.pregrading),
  ].filter(Boolean) as NormalizedScore[]

  return normalizedScores.map((score, i) => <ScoreRow key={i} {...score} latest={i === 0} maxScore={maxScore} />)
}

interface NoPregradingProps {
  maxScore?: number
}

function NoPregrading({ maxScore }: NoPregradingProps) {
  const { t } = useTranslation()
  return (
    <>
      <span className="e-result-scorecount-empty" />
      {maxScore && ` / ${maxScore} `}
      {t('points')}
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
  const { t } = useTranslation()

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
  return score !== undefined ? { score, shortCode: '', type: 'va' } : null
}

function normalizeCensoringScores(score: CensoringScore): NormalizedScore[] {
  return score.scores.map((s, i) => ({
    score: s.score,
    shortCode: s.shortCode || '',
    type: `${score.scores.length - i}.s`,
  }))
}

function normalizeInspectionScore(score: InspectionScore): NormalizedScore {
  return { score: score.score, shortCode: score.shortCodes ? score.shortCodes.join(', ') : '', type: 'ta' }
}

export default React.memo(ResultsExamQuestionManualScore)
