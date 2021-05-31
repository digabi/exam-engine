import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { ExamComponentProps } from '../../../createRenderChildNodes'
import { getNumericAttribute } from '../../../dom-utils'
import { AppState } from '../../../store'
import * as actions from '../../../store/answers/actions'
import { RichTextAnswer as RichTextAnswerT, TextAnswer as TextAnswerT } from '../../../types/ExamAnswer'
import AnswerToolbar from '../../AnswerToolbar'
import { ExamContext } from '../../context/ExamContext'
import { QuestionContext } from '../../context/QuestionContext'
import RichTextAnswer, { AnswerError } from '../RichTextAnswer'
import { Score } from '../../shared/Score'
import { answerScoreId } from '../../../ids'

interface Props extends ExamComponentProps {
  answer?: TextAnswerT | RichTextAnswerT
  answerBlurred: typeof actions.answerBlurred
  answerFocused: typeof actions.answerFocused
  saveAnswer: typeof actions.saveAnswer
  selectAnswerVersion: typeof actions.selectAnswerVersion
  showAnswerHistory: boolean
  supportsAnswerHistory: boolean
  type: 'rich-text' | 'multi-line' | 'single-line'
}

const borderWidthPx = 2
const borderHeightPx = 1

interface State {
  error: AnswerError | null
}

export class TextAnswerInput extends React.PureComponent<Props, State> {
  private ref: React.RefObject<HTMLInputElement & HTMLTextAreaElement>

  constructor(props: Props) {
    super(props)

    this.ref = React.createRef()
    this.state = {
      error: null,
    }
  }

  componentDidMount(): void {
    this.resize()
  }

  componentDidUpdate(): void {
    this.resize()
  }

  onChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { element, saveAnswer } = this.props
    const questionId = getNumericAttribute(element, 'question-id')!
    const displayNumber = element.getAttribute('display-number')!
    const value = event.currentTarget.value.trim()
    const answer: TextAnswerT = {
      type: 'text',
      questionId,
      value,
      characterCount: getCharacterCount(value),
      displayNumber,
    }
    saveAnswer(answer)
    this.clearErrors()
  }

  onRichTextChange = (answerHtml: string, answerText: string): void => {
    const { element, saveAnswer } = this.props
    const questionId = getNumericAttribute(element, 'question-id')!
    const displayNumber = element.getAttribute('display-number')!
    const answer: RichTextAnswerT = {
      type: 'richText',
      questionId,
      value: answerHtml,
      characterCount: getCharacterCount(answerText),
      displayNumber,
    }
    saveAnswer(answer)
    this.clearErrors()
  }

  onFocus = (): void => {
    this.props.answerFocused(getNumericAttribute(this.props.element, 'question-id')!)
  }

  onBlur = (): void => {
    this.props.answerBlurred(getNumericAttribute(this.props.element, 'question-id')!)
  }

  onError = (error: AnswerError): void => {
    this.setState({
      error,
    })
  }

  clearErrors = (): void => {
    this.setState({ error: null })
  }

  resize(): void {
    const { current } = this.ref

    if (current) {
      if (this.props.type === 'multi-line') {
        const { scrollX, scrollY } = window
        current.style.height = 'auto'
        current.style.height = `${current.scrollHeight + borderHeightPx}px`
        window.scrollTo(scrollX, scrollY)
      } else if (this.props.type === 'single-line') {
        current.style.width = '0'
        current.style.width = `${current.scrollWidth + borderWidthPx}px`
      }
    }
  }

  render(): React.ReactNode {
    const {
      answer,
      className,
      element,
      selectAnswerVersion,
      showAnswerHistory,
      supportsAnswerHistory,
      type,
    } = this.props
    const { error } = this.state
    const questionId = getNumericAttribute(element, 'question-id')
    const maxScore = getNumericAttribute(element, 'max-score')!
    const value = answer && answer.value
    const scoreId = answerScoreId(element)

    switch (type) {
      case 'rich-text':
        return (
          <>
            <ExamContext.Consumer>
              {({ examServerApi }) => (
                <RichTextAnswer
                  answer={answer as RichTextAnswerT}
                  className={classNames('text-answer text-answer--rich-text', className)}
                  saveScreenshot={(data) => examServerApi.saveScreenshot(questionId!, data)}
                  onChange={this.onRichTextChange}
                  onError={this.onError}
                  questionId={questionId!}
                />
              )}
            </ExamContext.Consumer>
            <AnswerToolbar
              {...{
                answer,
                element,
                selectAnswerVersion,
                showAnswerHistory,
                supportsAnswerHistory,
                error,
              }}
            />
          </>
        )
      case 'multi-line':
        return (
          <>
            <textarea
              className={classNames('text-answer text-answer--multi-line', className)}
              defaultValue={value}
              onChange={this.onChange}
              onFocus={this.onFocus}
              onBlur={this.onBlur}
              ref={this.ref}
              data-question-id={questionId}
            />
            <AnswerToolbar
              {...{
                answer,
                element,
                selectAnswerVersion,
                showAnswerHistory,
                supportsAnswerHistory,
              }}
            />
          </>
        )
      case 'single-line':
      default:
        return (
          <span className="e-nowrap">
            <input
              type="text"
              className={classNames('text-answer text-answer--single-line', className)}
              defaultValue={value}
              onChange={this.onChange}
              onFocus={this.onFocus}
              onBlur={this.onBlur}
              ref={this.ref}
              data-question-id={questionId}
              aria-describedby={scoreId}
            />
            <QuestionContext.Consumer>
              {({ answers }) => answers.length > 1 && <Score score={maxScore} size="inline" id={scoreId} />}
            </QuestionContext.Consumer>
          </span>
        )
    }
  }
}

export function getCharacterCount(answerText: string): number {
  return answerText.replace(/\s/g, '').length
}

function mapStateToProps(state: AppState, { element }: ExamComponentProps) {
  const type = (element.getAttribute('type') || 'single-line') as 'rich-text' | 'multi-line' | 'single-line'
  const questionId = getNumericAttribute(element, 'question-id')!
  const answer = state.answers.answersById[questionId] as TextAnswerT | RichTextAnswerT | undefined
  const supportsAnswerHistory = state.answers.supportsAnswerHistory
  const showAnswerHistory = state.answers.supportsAnswerHistory && state.answers.serverQuestionIds.has(questionId)

  return {
    answer,
    showAnswerHistory,
    supportsAnswerHistory,
    type,
  }
}

export default connect(mapStateToProps, {
  saveAnswer: actions.saveAnswer,
  selectAnswerVersion: actions.selectAnswerVersion,
  answerFocused: actions.answerFocused,
  answerBlurred: actions.answerBlurred,
})(TextAnswerInput)
