import classNames from 'classnames'
import { TOptions } from 'i18next'
import * as _ from 'lodash-es'
import React from 'react'
import * as richTextEditor from 'rich-text-editor/dist/rich-text-editor'
import { RichTextAnswer as RichTextAnswerT } from '../types/ExamAnswer'
import { CommonExamContext } from './CommonExamContext'

export interface AnswerError {
  key: 'screenshot-too-big' | 'screenshot-byte-limit-reached' | 'screenshot-upload-failed'
  options?: TOptions
}

interface Props {
  answer?: RichTextAnswerT
  className?: string
  questionId: number
  onChange: (answerHTML: string, answerText: string) => void
  onError: (error: AnswerError) => void
  saveScreenshot: (screenshot: Blob) => Promise<string>
}

export default class RichTextAnswer extends React.PureComponent<Props> {
  static contextType = CommonExamContext
  declare context: React.ContextType<typeof CommonExamContext>
  private ref: React.RefObject<HTMLDivElement>
  private lastHTML: string

  constructor(props: Props) {
    super(props)
    this.ref = React.createRef()
    this.lastHTML = this.props.answer ? this.props.answer.value : ''
  }

  componentDidMount(): void {
    const { current } = this.ref
    const { answer, saveScreenshot } = this.props

    if (current) {
      if (answer) {
        current.innerHTML = answer.value
      }

      richTextEditor.makeRichText(
        current,
        {
          locale: this.context.language.slice(0, 2).toUpperCase() as 'fi' | 'sv',
          screenshot: {
            saver: ({ data, type }) =>
              saveScreenshot(data instanceof Blob ? data : new Blob([data], { type })).catch((err) => {
                this.handleSaveError(err)
                throw err // Rethrow error so rich-text-editor can handle it.
              }),
          },
        },
        _.after(2, this.handleChange) /* TODO: Why does r-t-e send a change event in the beginning? */
      )
    }
  }

  handleSaveError = (err: unknown): void => {
    const key = (() => {
      switch (_.get(err, 'response.status')) {
        case 409:
          return 'screenshot-byte-limit-reached'
        case 413:
          return 'screenshot-too-big'
        default:
          return 'screenshot-upload-failed'
      }
    })()

    this.props.onError({ key })
  }

  handleChange = (data: { answerHTML: string; answerText: string }): void => {
    const { onChange } = this.props

    this.lastHTML = data.answerHTML
    onChange(data.answerHTML, data.answerText)
  }

  componentDidUpdate(): void {
    const { current } = this.ref

    // Don't update element unless value has changed from last known value to prevent cursor jumping
    if (current && this.props.answer && this.props.answer.value !== this.lastHTML) {
      current.innerHTML = this.lastHTML = this.props.answer.value
    }
  }

  render(): React.ReactNode {
    const { className, questionId } = this.props

    return (
      <div
        ref={this.ref}
        className={classNames('text-answer text-answer--multi-line', className)}
        data-question-id={questionId}
        role="textbox"
        aria-multiline="true"
        tabIndex={0}
      />
    )
  }
}
