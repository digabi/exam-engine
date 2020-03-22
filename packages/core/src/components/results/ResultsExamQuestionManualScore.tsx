import React, { useContext } from 'react'
import { Translation } from 'react-i18next'
import { QuestionContext } from '../QuestionContext'
import ResultsExamQuestionScoresContainer from './ResultsExamQuestionScoresContainer'
import { AnswerWithScores, InspectionScore, PregradingScore, CensoringScore } from '../types'

export interface ResultsExamQuestionManualScoreProps {
  scores: AnswerWithScores | null
  maxScore?: number
  displayNumber?: string
}

interface NormalizedScore {
  score: number
  shortCode: string
  type: string
}

function ResultsExamQuestionManualScore({ scores, maxScore, displayNumber }: ResultsExamQuestionManualScoreProps) {
  console.log(scores)
  const { answers } = useContext(QuestionContext)

  const containerProps = { answers, displayNumber }
  return (
    <ResultsExamQuestionScoresContainer {...containerProps}>
      {maxScore || null} <Translation>{t => t('points-max')}</Translation>
      {renderNormalizedScores(scores)}
    </ResultsExamQuestionScoresContainer>
  )
}

function renderNormalizedScores(scores?: AnswerWithScores | null) {
  if (!scores) return null

  const normalizedScores = [
    scores.inspection && normalizeInspectionScore(scores.inspection),
    ...(scores.censoring ? normalizeCensoringScores(scores.censoring) : []),
    scores.pregrading && normalizePregradingScore(scores.pregrading)
  ].filter(s => s) as NormalizedScore[]

  return normalizedScores.map((score, i) => (
    <div key={i}>
      <span>{i === 0 ? <b>{score.score} p</b> : score.score + ' p'} </span>
      <span>{score.shortCode} </span>
      <span>
        (<Translation>{t => t(score.type)}</Translation>)
      </span>
    </div>
  ))
}

function normalizePregradingScore({ score }: PregradingScore): NormalizedScore | null {
  return score ? { score, shortCode: '', type: 'va' } : null
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
