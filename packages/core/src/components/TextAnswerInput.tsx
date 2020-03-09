import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { getNumericAttribute } from '../dom-utils'
import { AppState } from '../store'
import * as actions from '../store/answers/actions'
import AnswerToolbar from './AnswerToolbar'
import { ExamContext } from './ExamContext'
import { QuestionContext } from './QuestionContext'
import RichTextAnswer from './RichTextAnswer'
import { Score } from './Score'
import { AnswerError, ExamComponentProps, RichTextAnswer as RichTextAnswerT, TextAnswer as TextAnswerT } from './types'

interface Props extends ExamComponentProps {
  answer?: TextAnswerT | RichTextAnswerT
  answerBlurred: typeof actions.answerBlurred
  answerFocused: typeof actions.answerFocused
  maxImages: number
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
      error: null
    }
  }

  componentDidMount() {
    this.resize()
  }

  componentDidUpdate() {
    this.resize()
  }

  onChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { element, saveAnswer } = this.props
    const questionId = getNumericAttribute(element, 'question-id')!
    const displayNumber = element.getAttribute('display-number')!
    const value = event.currentTarget.value
    const answer: TextAnswerT = {
      type: 'text',
      questionId,
      value,
      characterCount: getCharacterCount(value),
      displayNumber
    }
    saveAnswer(answer)
    this.clearErrors()
  }

  onRichTextChange = (answerHtml: string, answerText: string) => {
    const { element, saveAnswer } = this.props
    const questionId = getNumericAttribute(element, 'question-id')!
    const displayNumber = element.getAttribute('display-number')!
    const answer: RichTextAnswerT = {
      type: 'richText',
      questionId,
      value: answerHtml,
      characterCount: getCharacterCount(answerText),
      displayNumber
    }
    saveAnswer(answer)
    this.clearErrors()
  }

  onFocus = () => {
    this.props.answerFocused(getNumericAttribute(this.props.element, 'question-id')!)
  }

  onBlur = () => {
    this.props.answerBlurred(getNumericAttribute(this.props.element, 'question-id')!)
  }

  onError = (error: AnswerError) => {
    this.setState({
      error
    })
  }

  clearErrors = () => {
    this.setState({ error: null })
  }

  resize() {
    const { current } = this.ref

    if (current) {
      if (this.props.type === 'multi-line') {
        const { scrollX, scrollY } = window
        current.style.height = 'auto'
        current.style.height = current.scrollHeight + borderHeightPx + 'px'
        window.scrollTo(scrollX, scrollY)
      } else if (this.props.type === 'single-line') {
        current.style.width = '0'
        current.style.width = current.scrollWidth + borderWidthPx + 'px'
      }
    }
  }

  render() {
    const {
      answer,
      className,
      element,
      maxImages,
      selectAnswerVersion,
      showAnswerHistory,
      supportsAnswerHistory,
      type
    } = this.props
    const { error } = this.state
    const questionId = getNumericAttribute(element, 'question-id')
    const maxScore = getNumericAttribute(element, 'max-score')!
    const value = answer && answer.value

    switch (type) {
      case 'rich-text':
        return (
          <>
            <ExamContext.Consumer>
              {({ examServerApi }) => (
                <RichTextAnswer
                  answer={answer as RichTextAnswerT}
                  className={classNames('text-answer text-answer--rich-text', className)}
                  saveScreenshot={data => examServerApi.saveScreenshot(questionId!, data)}
                  onChange={this.onRichTextChange}
                  onError={this.onError}
                  maxImages={maxImages}
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
                error
              }}
            />
          </>
        )
      case 'multi-line':
        return (
          <>
            <textarea
              className={classNames('text-answer text-answer--multi-line', className)}
              value={value}
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
                supportsAnswerHistory
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
              value={value}
              onChange={this.onChange}
              onFocus={this.onFocus}
              onBlur={this.onBlur}
              ref={this.ref}
              data-question-id={questionId}
            />
            <QuestionContext.Consumer>
              {({ answers }) => answers.length > 1 && <Score score={maxScore} size="inline" />}
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
  const maxImages = getNumericAttribute(element, 'max-images')

  return {
    answer,
    showAnswerHistory,
    supportsAnswerHistory,
    type,
    maxImages: maxImages !== undefined ? maxImages : 50
  }
}

export default connect(mapStateToProps, {
  saveAnswer: actions.saveAnswer,
  selectAnswerVersion: actions.selectAnswerVersion,
  answerFocused: actions.answerFocused,
  answerBlurred: actions.answerBlurred
})(TextAnswerInput)
