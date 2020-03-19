import React, { useContext } from 'react'
import { Translation } from 'react-i18next'
import { QuestionContext } from '../QuestionContext'
import ResultsExamQuestionScoresContainer from './ResultsExamQuestionScoresContainer'

export interface ResultsExamQuestionManualScoreProps {
  scores: {
    pregrading?: PregradingProps
    censoring?: CensoringProps
    inspection?: InspectionProps
  }
  maxScore?: number
  displayNumber?: string
}

interface PregradingProps {
  score: number
  shortCode?: string
}

interface CensoringProps {
  scores: Array<{ score: number; shortCode?: string }>
}

interface InspectionProps {
  score: number
  shortCodes?: string[]
}

interface NormalizedScore {
  score: number
  shortCode: string
  type: string
}

function ResultsExamQuestionManualScore({ scores, maxScore, displayNumber }: ResultsExamQuestionManualScoreProps) {
  const { answers } = useContext(QuestionContext)
  const normalizedScores = [
    scores.inspection && normalizeInspectionScore(scores.inspection),
    ...(scores.censoring ? normalizeCensoringScores(scores.censoring) : []),
    scores.pregrading && normalizePregradingScore(scores.pregrading)
  ].filter(s => s) as NormalizedScore[]
  const containerProps = { answers, displayNumber }
  return (
    <ResultsExamQuestionScoresContainer {...containerProps}>
      {maxScore || null} <Translation>{t => t('points-max')}</Translation>
      {normalizedScores.map((score, i) => (
        <div key={i}>
          <span>{i === 0 ? <b>{score.score} p</b> : score.score + ' p'} </span>
          <span>{score.shortCode} </span>
          <span>
            (<Translation>{t => t(score.type)}</Translation>)
          </span>
        </div>
      ))}
    </ResultsExamQuestionScoresContainer>
  )
}

function normalizePregradingScore(score: PregradingProps): NormalizedScore {
  return { score: score.score, shortCode: score.shortCode || '', type: 'va' }
}

function normalizeCensoringScores(score: CensoringProps): NormalizedScore[] {
  return score.scores.map((s, i) => ({
    score: s.score,
    shortCode: s.shortCode || '',
    type: `${score.scores.length - i}.s`
  }))
}

function normalizeInspectionScore(score: InspectionProps): NormalizedScore {
  return { score: score.score, shortCode: score.shortCodes ? score.shortCodes.join(', ') : '', type: 'ta' }
}

export default React.memo(ResultsExamQuestionManualScore)
