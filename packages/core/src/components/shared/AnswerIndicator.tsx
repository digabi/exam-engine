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
  displayNumber: string
}

const AnswerIndicator = (props: Props) => {
  const { id, type, answer, error, displayNumber } = props

  const value = answer?.value
  const answerIsLongText = answer?.type === 'richText'
  const answerIsFormula = answerIsLongText && value?.includes('src="/math.svg?latex=')
  const answerIsImage =
    answerIsLongText && (value?.includes('<img src="/screenshot/') || value?.includes('<img src="data:image/png;'))

  const onClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation()
    window.location.href = `#question-nr-${displayNumber}`
  }

  return (
    <div
      key={id}
      className={classNames('answer-indicator', {
        ok: value,
        error,
        big: type === 'rich-text'
      })}
      data-indicator-id={id}
      onClick={onClick}
    >
      {answer?.type === 'richText' && (
        <>
          {(answerIsLongText && answer?.characterCount && <span>{answer.characterCount}</span>) || ''}
          {answerIsFormula && <span className="formula">∑</span>}
          {answerIsImage && (
            <span className="img">
              <FontAwesomeIcon icon={faImage} size="lg" />
            </span>
          )}
        </>
      )}
    </div>
  )
}

export const Indicator = memo(AnswerIndicator)
