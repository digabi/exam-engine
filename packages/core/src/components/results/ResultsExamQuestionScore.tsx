import React, { useContext } from 'react'
import { Translation } from 'react-i18next'
import { NBSP } from '../../dom-utils'
import { QuestionContext } from '../QuestionContext'
import { AutogradedScore, ManualScore, QuestionScore } from '../types'

interface ResultsExamQuestionScoreProps {
  scores: QuestionScore
  maxScore?: number
  displayNumber?: string
}

function ResultsExamQuestionScore({ scores, maxScore, displayNumber }: ResultsExamQuestionScoreProps) {
  if ((scores as AutogradedScore).type) {
    return ResultsExamQuestionAutoScore({ score: scores as AutogradedScore, maxScore, displayNumber })
  }
  return ResultsExamQuestionManualScore({ scores: scores as ManualScore[], maxScore, displayNumber })
}

function ResultsExamQuestionAutoScore({
  score,
  maxScore,
  displayNumber
}: {
  score: AutogradedScore
  maxScore?: number
  displayNumber?: string
}) {
  const { answers } = useContext(QuestionContext)
  return (
    <ScoresContainer answers={answers} displayNumber={displayNumber}>
      {score ? <b>{score.score}</b> : <div className="e-result-scorecount-empty" />}{' '}
      {maxScore ? `/ ${maxScore} ` : null} <Translation>{t => t('points')}</Translation>
    </ScoresContainer>
  )
}

function ResultsExamQuestionManualScore({
  scores,
  maxScore,
  displayNumber
}: {
  scores: ManualScore[]
  maxScore?: number
  displayNumber?: string
}) {
  const { answers } = useContext(QuestionContext)
  const normalizedScores = scores.map(getScores).reduce((a, b) => [...a, ...b])

  return (
    <ScoresContainer answers={answers} displayNumber={displayNumber}>
      {maxScore || null} <Translation>{t => t('points-max')}</Translation>
      {normalizedScores.map((score, i) => (
        <div key={i}>
          <span>{i === 0 ? <b>{score.score} p</b> : score.score + ' p'} </span>
          <span>{score.shortCode} </span>
          <span>({score.type})</span>
        </div>
      ))}
    </ScoresContainer>
  )
}

function ScoresContainer({
  answers,
  displayNumber,
  children
}: {
  answers: Element[]
  displayNumber?: string
  children: React.ReactNode
}) {
  return (
    <div className="e-result-scorecount e-float-right">
      {answers.length > 1 && displayNumber && <sup>{displayNumber}</sup>}
      {NBSP}
      {children}
    </div>
  )
}

function getScores(score: ManualScore | AutogradedScore) {
  switch (score.type) {
    case 'autograded':
      return [{ score: score.score, shortCode: '', type: '' }]
    case 'pregrading':
      return [{ score: score.score, shortCode: '', type: 'va' }]
    case 'censor':
      return score.scores.map((s, i) => ({
        score: s.score,
        shortCode: s.shortCode,
        type: `${score.scores.length - i}.s`
      }))
    case 'inspection':
      return [{ score: score.score, shortCode: score.shortCodes.join(', '), type: 'ta' }]
  }
}
export default React.memo(ResultsExamQuestionScore)
