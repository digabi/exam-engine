import React from 'react'
import { useExamTranslation } from '../../i18n'

export interface UndoHistoryEntryProps {
  croppedAnswer: string
  minutesSinceAnswer: number
  answerIndex: number
  selected: boolean
  onChange: (index: number) => void
  wordCount: number
  characterCount: number
  screenshotCount: number
}

export class UndoHistoryEntry extends React.PureComponent<UndoHistoryEntryProps> {
  private entryInputRef: React.RefObject<HTMLInputElement>
  private labelInputRef: React.RefObject<HTMLLabelElement>

  constructor(props: UndoHistoryEntryProps) {
    super(props)
    this.entryInputRef = React.createRef()
    this.labelInputRef = React.createRef()
  }

  public componentDidMount() {
    if (this.entryInputRef.current && this.props.answerIndex === 0) {
      this.entryInputRef.current.focus()
    }
  }

  private inputValueChanged = () => {
    this.props.onChange(this.props.answerIndex)
    if (this.labelInputRef && this.labelInputRef.current) {
      this.labelInputRef.current.scrollIntoView({ block: 'center' })
    }
  }

  public render() {
    const { selected, croppedAnswer, wordCount, characterCount, screenshotCount, answerIndex, minutesSinceAnswer } =
      this.props
    return (
      <label ref={this.labelInputRef} className="js-undo-history-entry">
        <input
          type="radio"
          className="k-undo-view-entry-tab"
          name="undoHistory"
          value={answerIndex}
          checked={selected}
          onChange={this.inputValueChanged}
          ref={this.entryInputRef}
        />
        <UndoEntry
          croppedAnswer={croppedAnswer}
          wordCount={wordCount}
          characterCount={characterCount}
          screenshotCount={screenshotCount}
          answerIndex={answerIndex}
          minutesSinceAnswer={minutesSinceAnswer}
        />
      </label>
    )
  }
}

interface UndoEntryProps {
  croppedAnswer: string
  wordCount: number
  characterCount: number
  screenshotCount: number
  answerIndex: number
  minutesSinceAnswer: number
}

const UndoEntry = ({
  croppedAnswer,
  wordCount,
  characterCount,
  screenshotCount,
  answerIndex,
  minutesSinceAnswer
}: UndoEntryProps) => {
  const { t } = useExamTranslation()
  const wordCountText = wordCount > 0 ? t('undo.answerWordCount', { count: wordCount }) : null
  const characterCountText = characterCount > 0 ? t('undo.answerCharacterCount', { count: characterCount }) : null
  const imageCountText = screenshotCount > 0 ? t('undo.answerImageCount', { count: screenshotCount }) : null

  const arr = [wordCountText, characterCountText, imageCountText].filter(x => x !== null)

  return (
    <div className="k-undo-view-entry js-undo-entry-content">
      <div className="js-undo-history-entry-time">
        {answerIndex === 0 ? t('undo.latestVersion') : t('undo.minutesSinceAnswer', { minutes: minutesSinceAnswer })}
      </div>
      <div className="k-undo-view-answer-cropped js-undo-history-entry-answer">
        {croppedAnswer || t('undo.answerNoText')}
      </div>
      <div className="k-undo-view-answer-length js-undo-history-entry-stats">
        {arr.map((el, index) => (
          <>
            {el}
            {index < arr.length - 1 && <span>, </span>}
          </>
        ))}
      </div>
    </div>
  )
}
