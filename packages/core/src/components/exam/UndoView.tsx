import axios from 'axios'
import React from 'react'
import { UndoHistoryEntry } from './UndoHistoryEntry'
import ModalDialog from '../shared/internal/ModalDialog'
import { useExamTranslation } from '../../i18n'
import { QuestionId, RichTextAnswer, TextAnswer } from '../../types/ExamAnswer'

const CancelToken = axios.CancelToken

export interface AnswerHistoryEntry {
  type: 'text' | 'richText'
  value: string
  characterCount: number
  answerTime: number
}

export interface UndoViewProps {
  close: () => void
  restoreAnswer: (examAnswer: TextAnswer | RichTextAnswer) => void
  questionId: number
  title: string
}

interface UndoViewState {
  answers: AnswerHistoryEntry[]
  selectedAnswerIndex: number
  loading: boolean
  loadRetryTimeout: number | null
}
type AnswerHistoryResult = {
  type: 'text' | 'richText'
  value: string
  answer_time: number
  character_count: number
}
function toAnswerHistoryEntry(answer: AnswerHistoryResult): AnswerHistoryEntry {
  return {
    type: answer.type,
    value: answer.value,
    answerTime: answer.answer_time,
    characterCount: answer.character_count
  }
}

function AnswerDisplay(props: { selectedAnswer?: AnswerHistoryEntry }) {
  const { selectedAnswer } = props
  return selectedAnswer ? (
    selectedAnswer.type === 'richText' ? (
      <div
        className="e-undo-view-answer-content js-undo-answer-detail"
        dangerouslySetInnerHTML={{ __html: selectedAnswer.value }}
      />
    ) : (
      <div className="e-undo-view-answer-content js-undo-answer-detail plainText">{selectedAnswer.value}</div>
    )
  ) : null
}

function BottomBar(props: {
  selectedAnswer?: AnswerHistoryEntry
  selectedAnswerIndex: number
  restoreAnswer: (examAnswer: TextAnswer | RichTextAnswer) => void
  questionId: QuestionId
}) {
  const { selectedAnswer, selectedAnswerIndex, restoreAnswer, questionId } = props
  const disableRestoreButton = !selectedAnswer || selectedAnswerIndex === 0
  return (
    <div className="e-undo-view-bottom-bar">
      <button
        className="e-button-default e-button js-restore-answer-button"
        disabled={disableRestoreButton}
        onClick={() => selectedAnswer && restoreAnswer({ ...selectedAnswer, questionId })}
      >
        <RestoreButtonLabel />
      </button>
    </div>
  )
}

function escapedHtml(html: string) {
  const container = document.createElement('div')
  container.innerHTML = html
  return container.innerText
}
function getAnswerText(answer: AnswerHistoryEntry) {
  const fullText = answer.type === 'text' ? answer.value : escapedHtml(answer.value)
  return fullText.replace(/\s+/g, ' ').trim()
}

function truncateAnswer(answer: AnswerHistoryEntry, length = 50): string {
  const answerText = getAnswerText(answer)
  if (answerText.length <= length) {
    return answerText
  }

  const separator = '…'
  const charsToShow = length - separator.length
  const startChars = Math.ceil(charsToShow / 2)
  const endChars = charsToShow - startChars

  return answerText.substr(0, startChars) + separator + answerText.substr(answerText.length - endChars)
}

function countCharacters(answer: AnswerHistoryEntry) {
  const text = getAnswerText(answer)
  return text.replace(/\s/g, '').length
}

function countScreenshots(answer: AnswerHistoryEntry): number {
  const answerElement = document.createElement('div')
  answerElement.innerHTML = answer.value
  const equationImageSelector = 'img[src^="/math.svg"], img[src^="data:image/svg+xml"]'
  const imageCount = answerElement.querySelectorAll('img').length
  const emptyImageCount = answerElement.querySelectorAll('img[src=""]').length
  const equationCount = answerElement.querySelectorAll(equationImageSelector).length
  return imageCount - equationCount - emptyImageCount
}

export class UndoView extends React.PureComponent<UndoViewProps, UndoViewState> {
  private source = CancelToken.source()

  constructor(props: UndoViewProps) {
    super(props)
    this.state = {
      answers: [],
      selectedAnswerIndex: 0,
      loading: true,
      loadRetryTimeout: null
    }
  }

  public componentDidMount() {
    document.addEventListener('keydown', this.keydownListener, false)
    void this.fetchAnswerHistory(this.props.questionId)
  }

  public componentWillUnmount() {
    this.source.cancel()
    document.removeEventListener('keydown', this.keydownListener, false)
  }

  public componentDidUpdate(prevProps: UndoViewProps) {
    if (this.props.questionId !== prevProps.questionId) {
      void this.fetchAnswerHistory(this.props.questionId)
    }
  }

  private overlayClicked(event: React.MouseEvent<HTMLDivElement>): void {
    const targetClass = (event.target as HTMLDivElement).className
    if (targetClass.includes('js-undo-overlay')) {
      this.close()
    }
  }

  private keydownListener = (event: KeyboardEvent) => {
    if (event.keyCode === 13) {
      const selectedAnswer: AnswerHistoryEntry = this.state.answers[this.state.selectedAnswerIndex]
      this.props.restoreAnswer({ ...selectedAnswer, questionId: this.props.questionId })
      this.close()
    }
  }

  private async fetchAnswerHistory(questionId: number) {
    try {
      const answerHistoryResult = await axios.get<AnswerHistoryResult[]>(`/rest/answer-history/${questionId}`, {
        cancelToken: this.source.token
      })
      const answerHistory = answerHistoryResult.data
      const answers = answerHistory.map(toAnswerHistoryEntry)
      this.setState({ answers, selectedAnswerIndex: 0, loading: false, loadRetryTimeout: null })
    } catch (error) {
      if (!axios.isCancel(error)) {
        this.setState({
          loadRetryTimeout: window.setTimeout(() => {
            void this.fetchAnswerHistory(questionId)
          }, 4000)
        })
      }
    }
  }

  private close() {
    const timeout = this.state.loadRetryTimeout
    if (timeout) {
      clearTimeout(timeout)
    }
    this.source.cancel()
    this.props.close()
  }

  public render() {
    const selectedAnswer = this.state.answers[this.state.selectedAnswerIndex]
    const now = new Date().getTime()
    return (
      <ModalDialog onClose={this.close.bind(this)}>
        <div onClick={this.overlayClicked.bind(this)} className="e-overlay js-undo-overlay" aria-modal="true">
          <div id="undo" className="e-undo-view">
            <CloseButton close={this.close.bind(this)} />

            {this.state.loading ? (
              <Loading />
            ) : (
              <div className="e-undo-view-content">
                <div className="e-undo-view-answer-index js-undo-answer-index">
                  {this.state.answers.map((answer, index) => {
                    const timeSinceAnswer = now - new Date(answer.answerTime).getTime()
                    const toMinutes = Math.round(timeSinceAnswer / 1000 / 60)
                    return (
                      <UndoHistoryEntry
                        key={new Date(answer.answerTime).getTime()}
                        answerIndex={index}
                        selected={index === this.state.selectedAnswerIndex}
                        onChange={index => this.setState({ selectedAnswerIndex: index })}
                        croppedAnswer={truncateAnswer(answer)}
                        minutesSinceAnswer={toMinutes}
                        characterCount={countCharacters(answer)}
                        screenshotCount={countScreenshots(answer)}
                      />
                    )
                  })}
                </div>
                <div className="e-undo-view-right-panel">
                  <div className="e-undo-view-header js-undo-view-header">
                    <h3 className="e-undo-view-title js-undo-view-title">{this.props.title}</h3>
                  </div>
                  <AnswerDisplay selectedAnswer={selectedAnswer} />
                  <BottomBar
                    selectedAnswer={selectedAnswer}
                    selectedAnswerIndex={this.state.selectedAnswerIndex}
                    restoreAnswer={this.props.restoreAnswer}
                    questionId={this.props.questionId}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </ModalDialog>
    )
  }
}

const Loading = () => {
  const { t } = useExamTranslation()
  return <div style={{ padding: '10px' }}>{t('undo.loading')}</div>
}

const CloseButton = ({ close }: { close: () => void }) => {
  const { t } = useExamTranslation()
  return (
    <div>
      <svg
        id="closeUndoDialogButton"
        className="e-undo-view-close-overlay-button js-close-undo-dialog-button"
        onClick={close}
        tabIndex={0}
        role="button"
        aria-label={t('undo.close') as string}
        width="30"
        height="30"
        viewBox="0 0 30 30"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="30" height="30" fill="#fff" opacity="0" />
        <line x1="25" y1="5" x2="5" y2="25" fill="none" stroke="#6d6d6d" strokeMiterlimit="10" strokeWidth="3" />
        <line x1="5" y1="5" x2="25" y2="25" fill="none" stroke="#6d6d6d" strokeMiterlimit="10" strokeWidth="3" />
      </svg>
    </div>
  )
}

const RestoreButtonLabel = () => {
  const { t } = useExamTranslation()
  return <div>{t('undo.restoreAnswer')}</div>
}
