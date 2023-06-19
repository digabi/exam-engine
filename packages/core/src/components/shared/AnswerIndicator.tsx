import React, { memo } from 'react'
import classNames from 'classnames'
import { ExamAnswer } from '../../types/ExamAnswer'
import { useSelector } from 'react-redux'
import { AnswersState } from '../../store/answers/reducer'

type Props = {
  id: number
  type: string
  answer: ExamAnswer
  displayNumber: string
}

const AnswerIndicator = (props: Props) => {
  const { id, type, answer, displayNumber } = props
  const validationErrors = useSelector((state: { answers: AnswersState }) => state.answers.validationErrors).filter(
    (i) => i.displayNumber === displayNumber
  )
  console.log(displayNumber, validationErrors)

  const answerIsFormula = answer?.value.includes('math.svg')
  const answerIsImage = answer?.value.includes('data:image')
  const answerIsLongText = answer?.type === 'richText' && !answerIsFormula && !answerIsImage

  return (
    <div
      key={id}
      className={classNames('answer-indicator', {
        ok: answer?.value,
        error: validationErrors.length > 0,
        big: type === 'rich-text',
      })}
    >
      {answer?.type === 'richText' && (
        <>
          {answerIsFormula && '∑'}
          {answerIsImage && 'img'}
          {(answerIsLongText && answer?.characterCount) || ''}
        </>
      )}
    </div>
  )
}

export const Indicator = memo(AnswerIndicator)
