import classNames from 'classnames'
import React, { useContext } from 'react'
import { Translation } from 'react-i18next'
import { QuestionContext } from '../QuestionContext'
import { CensoringScore, InspectionScore, PregradingScore, Score } from '../types'
import ResultsExamQuestionScoresContainer from './ResultsExamQuestionScoresContainer'

export interface ResultsExamQuestionManualScoreProps {
  scores?: Score
  maxScore?: number
  displayNumber?: string
}

interface NormalizedScore {
  score: number
  shortCode: string
  type: string
}

function ResultsExamQuestionManualScore({ scores, maxScore, displayNumber }: ResultsExamQuestionManualScoreProps) {
  const { answers } = useContext(QuestionContext)
  const containerProps = { answers, displayNumber }
  const shortCode = scores?.censoring?.nonAnswerDetails?.shortCode

  return (
    <ResultsExamQuestionScoresContainer {...containerProps}>
      {!scores?.pregrading && !scores?.censoring && <NoPregrading maxScore={maxScore} />}
      {scores && renderNormalizedScores(scores, maxScore)}
      {shortCode && <NonAnswer shortCode={shortCode} />}
    </ResultsExamQuestionScoresContainer>
  )
}

function renderNormalizedScores(scores: Score, maxScore?: number) {
  const normalizedScores = [
    scores.inspection && normalizeInspectionScore(scores.inspection),
    ...(scores.censoring ? normalizeCensoringScores(scores.censoring) : []),
    scores.pregrading && normalizePregradingScore(scores.pregrading)
  ].filter(s => s) as NormalizedScore[]

  return normalizedScores.map((score, i) => <ScoreRow key={i} {...score} latest={i === 0} maxScore={maxScore} />)
}

interface NoPregradingProps {
  maxScore?: number
}

function NoPregrading({ maxScore }: NoPregradingProps) {
  return (
    <>
      <span className="e-result-scorecount-empty" />
      {maxScore && ` / ${maxScore} `}
      <Translation>{t => t('points')}</Translation>
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
  return (
    <div className={latest ? 'e-color-black' : 'e-color-grey e-font-size-xs'}>
      <ScoreColumn className={classNames('e-nowrap', { 'e-font-size-m': latest })}>
        {latest ? <b>{score}</b> : score}
        {latest && maxScore ? ` / ${maxScore}` : ''}
        {` p.`}
      </ScoreColumn>
      <ScoreColumn className="e-result-scorecount-shortcode">{shortCode}</ScoreColumn>
      <ScoreColumn className="e-mrg-r-0">
        <Translation>{t => t(type)}</Translation>
      </ScoreColumn>
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
    type: `${score.scores.length - i}.s`
  }))
}

function normalizeInspectionScore(score: InspectionScore): NormalizedScore {
  return { score: score.score, shortCode: score.shortCodes ? score.shortCodes.join(', ') : '', type: 'ta' }
}

export default React.memo(ResultsExamQuestionManualScore)
