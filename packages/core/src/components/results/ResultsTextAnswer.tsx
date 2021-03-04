import React, { useContext } from 'react'
import { TextAnswer } from '../..'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { getNumericAttribute } from '../../dom-utils'
import { useExamTranslation } from '../../i18n'
import { shortDisplayNumber } from '../../shortDisplayNumber'
import AnswerToolbar from '../AnswerToolbar'
import { QuestionContext } from '../QuestionContext'
import { findScore, ResultsContext } from './ResultsContext'
import ResultsExamQuestionManualScore from './ResultsExamQuestionManualScore'
import { ResultsMultiLineAnswer } from './ResultsMultiLineAnswer'
import ResultsSingleLineAnswer from './ResultsSingleLineAnswer'

function ResultsTextAnswer({ element }: ExamComponentProps) {
  const { answers } = useContext(QuestionContext)
  const { answersByQuestionId, scores } = useContext(ResultsContext)
  const { t } = useExamTranslation()
  const questionId = getNumericAttribute(element, 'question-id')!
  const maxScore = getNumericAttribute(element, 'max-score')!
  const answer = answersByQuestionId[questionId] as TextAnswer | undefined
  const value = answer && answer.value
  const displayNumber = answers.length > 1 ? shortDisplayNumber(element.getAttribute('display-number')!) : undefined
  const score = findScore(scores, questionId)
  const comment = score?.pregrading?.comment
  const type = (element.getAttribute('type') || 'single-line') as 'rich-text' | 'multi-line' | 'single-line'

  switch (type) {
    case 'rich-text':
    case 'multi-line': {
      return (
        <>
          <ResultsExamQuestionManualScore multilineAnswer={true} scores={score} maxScore={maxScore} />
          <ResultsMultiLineAnswer {...{ type, value, score }} />
          <AnswerToolbar
            {...{
              answer,
              element,
            }}
          />
          {comment && (
            <>
              <h5>{t('comment')}</h5>
              <p className="e-italic">{comment}</p>
            </>
          )}
        </>
      )
    }
    case 'single-line':
    default:
      return (
        <ResultsSingleLineAnswer
          {...{
            answers,
            score,
            displayNumber,
            value,
          }}
        >
          <ResultsExamQuestionManualScore {...{ scores: score, maxScore, displayNumber }} />
        </ResultsSingleLineAnswer>
      )
  }
}

export default React.memo(ResultsTextAnswer)
