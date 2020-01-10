import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { getNumericAttribute } from '../dom-utils'
import { AppState } from '../store'
import AnswerToolbar from './AnswerToolbar'
import { ExamComponentProps, RichTextAnswer as RichTextAnswerT, TextAnswer as TextAnswerT } from './types'

interface Props extends ExamComponentProps {
  answer?: TextAnswerT | RichTextAnswerT
  type: 'rich-text' | 'multi-line' | 'single-line'
}

export class TextAnswerResult extends React.PureComponent<Props, {}> {
  render() {
    const { answer, className, element, type } = this.props
    const value = answer && answer.value

    switch (type) {
      case 'rich-text':
      case 'multi-line':
        return (
          <>
            <div dangerouslySetInnerHTML={{ __html: value! }} />
            <AnswerToolbar
              {...{
                answer,
                element
              }}
            />
          </>
        )
      case 'single-line':
      default:
        return <span className={classNames('text-answer text-answer--single-line', className)}>{value}</span>
    }
  }
}

function mapStateToProps(state: AppState, { element }: ExamComponentProps) {
  const type = (element.getAttribute('type') || 'single-line') as 'rich-text' | 'multi-line' | 'single-line'
  const questionId = getNumericAttribute(element, 'question-id')!
  const answer = state.answers.answersById[questionId] as TextAnswerT | RichTextAnswerT | undefined

  return {
    answer,
    type
  }
}

export default connect(mapStateToProps)(TextAnswerResult)
