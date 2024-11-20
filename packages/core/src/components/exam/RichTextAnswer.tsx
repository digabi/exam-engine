import { TOptions } from 'i18next'
import * as _ from 'lodash-es'
import React from 'react'
import { RichTextAnswer as RichTextAnswerT } from '../../types/ExamAnswer'
import { CommonExamContext } from '../context/CommonExamContext'
import RichTextEditor, { Answer, RichTextEditorHandle } from 'rich-text-editor'
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
  private editorRef: React.RefObject<RichTextEditorHandle>
  private lastHTML: string

  constructor(props: Props) {
    super(props)
    this.editorRef = React.createRef()
    this.lastHTML = this.props.answer ? this.props.answer.value : ''
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

  handleChange = (answer: Answer): void => {
    const { onChange } = this.props

    this.lastHTML = answer.answerHtml
    onChange(answer.answerHtml, answer.answerText)
  }

  componentDidUpdate(): void {
    /**
     * Don't update element unless value has changed from last known value to prevent cursor jumping
     * This implementation is _primarily_ intended to be used by AnswerToolbar's answerHistory, which
     * will update the value of `answer` without the user making edits to the rich-text-editor input field
     * */
    if (this.editorRef.current && this.props.answer && this.props.answer.value !== this.lastHTML) {
      this.lastHTML = this.props.answer.value
      this.editorRef.current.setValue(this.props.answer.value)
    }
  }

  render(): React.ReactNode {
    const { questionId, className, labelledBy, answer, lang, invalid, saveScreenshot } = this.props
    return (
      <ExpandQuestionContext.Consumer>
        {({ expanded, toggleWriterMode }) => (
          <>
            <RichTextEditor
              ref={this.editorRef}
              baseUrl={''}
              initialValue={answer?.value}
              language={this.context.language.slice(0, 2).toUpperCase() as 'FI' | 'SV'}
              onValueChange={this.handleChange}
              getPasteSource={(file: File) =>
                saveScreenshot(file).catch((err: ErrorResponse) => {
                  this.handleSaveError(err)
                  throw err // Rethrow error so rich-text-editor can handle it.
                })
              }
              textAreaProps={{
                ariaInvalid: invalid,
                ariaLabelledBy: labelledBy,
                id: questionId.toString(),
                questionId,
                className,
                lang
              }}
            ></RichTextEditor>
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
