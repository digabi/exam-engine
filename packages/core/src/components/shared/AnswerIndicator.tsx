import React, { memo } from 'react'
import classNames from 'classnames'
import { ExamAnswer } from '../../types/ExamAnswer'

type Props = {
  id: number
  type: string
  maxLength?: number
  answer: ExamAnswer
}

const AnswerIndicator = (props: Props) => {
  const answer = props.answer
  const type = answer?.type
  const answerIsFormula = answer?.value.includes('math.svg')
  const answerIsImage = answer?.value.includes('data:image')
  const answerIsLongText = type === 'richText' && !answerIsFormula && !answerIsImage
  const textType = type === 'richText' || type === 'text'
  const tooLong = textType && props.maxLength && answer?.characterCount > props.maxLength

  return (
    <div
      key={props.id}
      className={classNames('q', {
        ok: answer?.value,
        tooLong,
        big: props.type === 'rich-text',
        [type]: type,
      })}
    >
      {type === 'richText' && (
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
