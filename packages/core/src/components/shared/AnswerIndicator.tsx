import React, { memo } from 'react'
import classNames from 'classnames'
import { ExamAnswer } from '../../types/ExamAnswer'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage } from '@fortawesome/free-solid-svg-icons'

type Props = {
  id: number
  type: string
  answer: ExamAnswer
  error: boolean
}

const AnswerIndicator = (props: Props) => {
  const { id, type, answer, error } = props

  const answerIsFormula = answer?.value.includes('math.svg')
  const answerIsImage = answer?.value.includes('data:image')
  const answerIsLongText = answer?.type === 'richText' && !answerIsFormula && !answerIsImage

  return (
    <div
      key={id}
      className={classNames('answer-indicator', {
        ok: answer?.value,
        error,
        big: type === 'rich-text',
      })}
    >
      {answer?.type === 'richText' && (
        <>
          {answerIsFormula && '∑'}
          {answerIsImage && <FontAwesomeIcon icon={faImage} size="lg" />}
          {(answerIsLongText && answer?.characterCount) || ''}
        </>
      )}
    </div>
  )
}

export const Indicator = memo(AnswerIndicator)
