import { TOptions } from 'i18next'
import * as _ from 'lodash-es'
import React from 'react'
import { RichTextAnswer as RichTextAnswerT } from '../../types/ExamAnswer'
import { CommonExamContext } from '../context/CommonExamContext'
import { makeRichText } from 'rich-text-editor'
import { ExpandQuestionContext } from './Question'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExpandAlt } from '@fortawesome/free-solid-svg-icons'
import { useExamTranslation } from '../../i18n'

export interface ScreenshotError {
  key: 'screenshot-too-big' | 'screenshot-byte-limit-reached' | 'screenshot-upload-failed'
  options?: TOptions
}

type ErrorResponse = { response: { status: number } } & Error

interface Props {
  answer?: RichTextAnswerT
  className?: string
  questionId: number
  invalid: boolean
  onChange: (answerHTML: string, answerText: string) => void
  onError: (error: ScreenshotError) => void
  saveScreenshot: (screenshot: Blob) => Promise<string>
  labelledBy: string
  lang?: string
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

      makeRichText(
        current,
        {
          locale: this.context.language.slice(0, 2).toUpperCase() as 'FI' | 'SV',
          screenshotSaver: ({ data, type }: { data: Buffer; type: string }) =>
            saveScreenshot(data instanceof Blob ? data : new Blob([data], { type })).catch((err: ErrorResponse) => {
              this.handleSaveError(err)
              throw err // Rethrow error so rich-text-editor can handle it.
            })
        },
        this.handleChange
      )
    }
  }

  handleSaveError = (err: ErrorResponse): void => {
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
    const { className, questionId, invalid, lang, labelledBy } = this.props
    return (
      <ExpandQuestionContext.Consumer>
        {({ expanded, toggleWriterMode }) => (
          <>
            <div
              ref={this.ref}
              className={className}
              data-question-id={questionId}
              role="textbox"
              aria-multiline="true"
              aria-invalid={invalid}
              tabIndex={0}
              lang={lang}
              aria-labelledby={labelledBy}
              id={String(questionId)}
            />
            {!expanded && (
              <button
                className="expand open"
                onClick={() => toggleWriterMode(true)}
                aria-labelledby="expand-label"
                aria-owns={String(questionId)}
              >
                <ExpandButtonLabel />
                <FontAwesomeIcon icon={faExpandAlt} />
              </button>
            )}
          </>
        )}
      </ExpandQuestionContext.Consumer>
    )
  }
}

const ExpandButtonLabel = () => {
  const { t } = useExamTranslation()
  return (
    <div className="label" id="expand-label">
      {t('open-writing-mode')}
    </div>
  )
}
