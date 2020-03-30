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
  return (
    <ResultsExamQuestionScoresContainer {...containerProps}>
      {renderNormalizedScores(scores, maxScore)}
    </ResultsExamQuestionScoresContainer>
  )
}

function renderNormalizedScores(scores?: Score, maxScore?: number) {
  if (!scores) {
    return null
  }

  const normalizedScores = [
    scores.inspection && normalizeInspectionScore(scores.inspection),
    ...(scores.censoring ? normalizeCensoringScores(scores.censoring) : []),
    scores.pregrading && normalizePregradingScore(scores.pregrading)
  ].filter(s => s) as NormalizedScore[]

  return normalizedScores.map((score, i) => <ScoreRow key={i} {...score} latest={i === 0} maxScore={maxScore} />)
}

interface ScoreRowProps {
  maxScore?: number
  latest: boolean
}

function ScoreRow({ score, shortCode, type, maxScore, latest }: ScoreRowProps & NormalizedScore) {
  return (
    <div className={latest ? 'e-color-black' : 'e-color-grey'}>
      <ScoreColumn className={`${latest && 'e-font-size-m'}`}>
        {latest ? <b>{score}</b> : score}
        {latest && maxScore ? ` / ${maxScore}` : ''}
        {` p.`}
      </ScoreColumn>
      <ScoreColumn>{shortCode}</ScoreColumn>
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

function ScoreColumn({ children, className }: ScoreColumnProps) {
  return <span className={`e-font-size-xs e-mrg-r-1 ${className || ''}`}>{children}</span>
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
