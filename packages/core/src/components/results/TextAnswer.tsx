import React, { useContext } from 'react'
import { TextAnswer } from '../..'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { getNumericAttribute } from '../../dom-utils'
import { useExamTranslation } from '../../i18n'
import { shortDisplayNumber } from '../../shortDisplayNumber'
import AnswerToolbar from '../AnswerToolbar'
import { QuestionContext } from '../context/QuestionContext'
import { findScore, ResultsContext } from '../context/ResultsContext'
import AnswerLengthInfo from '../shared/AnswerLengthInfo'
import ResultsExamQuestionManualScore from './internal/QuestionManualScore'
import { MultiLineAnswer } from './MultiLineAnswer'
import ResultsSingleLineAnswer from './SingleLineAnswer'

function TextAnswer({ element }: ExamComponentProps) {
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
  const type = (element.getAttribute('type') || 'single-line') as 'rich-text' | 'single-line'
  const maxLength = getNumericAttribute(element, 'max-length')

  switch (type) {
    case 'rich-text': {
      return (
        <>
          {maxLength != null && <AnswerLengthInfo {...{ maxLength }} />}
          <ResultsExamQuestionManualScore
            multilineAnswer={true}
            scores={score}
            maxScore={maxScore}
            questionId={questionId}
          />
          <MultiLineAnswer {...{ type, value, score }} />
          <AnswerToolbar
            {...{
              answer,
              element
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
            value
          }}
        >
          <ResultsExamQuestionManualScore {...{ scores: score, maxScore, displayNumber, questionId }} />
        </ResultsSingleLineAnswer>
      )
  }
}

export default React.memo(TextAnswer)
