import React from 'react'
import { useExamTranslation } from '../../i18n'

export interface UndoHistoryEntryProps {
  croppedAnswer: string
  minutesSinceAnswer: number
  answerIndex: number
  selected: boolean
  onChange: (index: number) => void
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
    const { selected, croppedAnswer, characterCount, screenshotCount, answerIndex, minutesSinceAnswer } = this.props
    return (
      <label ref={this.labelInputRef} className="js-undo-history-entry">
        <input
          type="radio"
          className="e-undo-view-entry-tab"
          name="undoHistory"
          value={answerIndex}
          checked={selected}
          onChange={this.inputValueChanged}
          ref={this.entryInputRef}
        />
        <UndoEntry
          croppedAnswer={croppedAnswer}
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
  characterCount: number
  screenshotCount: number
  answerIndex: number
  minutesSinceAnswer: number
}

const UndoEntry = ({
  croppedAnswer,
  characterCount,
  screenshotCount,
  answerIndex,
  minutesSinceAnswer
}: UndoEntryProps) => {
  const { t } = useExamTranslation()
  const characterCountText = characterCount > 0 ? t('undo.answerCharacterCount', { count: characterCount }) : null
  const imageCountText = screenshotCount > 0 ? t('undo.answerImageCount', { count: screenshotCount }) : null

  const arr = [characterCountText, imageCountText].filter(x => x !== null)

  return (
    <div className="e-undo-view-entry js-undo-entry-content">
      <div className="js-undo-history-entry-time">
        {answerIndex === 0 ? t('undo.latestVersion') : t('undo.minutesSinceAnswer', { minutes: minutesSinceAnswer })}
      </div>
      <div className="e-undo-view-answer-cropped js-undo-history-entry-answer">
        {croppedAnswer || t('undo.answerNoText')}
      </div>
      <div className="e-undo-view-answer-length js-undo-history-entry-stats">
        {arr.map((el, index) => (
          <React.Fragment key={index}>
            {el}
            {index < arr.length - 1 && <span>, </span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
