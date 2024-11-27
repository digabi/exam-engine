import React from 'react'
import { ExamComponentProps } from '../..'
import { useExamTranslation } from '../../i18n'

export const DNDAnswerOption = ({
  element,
  renderChildNodes,
  style,
  className
}: ExamComponentProps & {
  style?: React.CSSProperties
  className?: 'correct-answer' | 'wrong-answer'
}) => {
  const hasImages = !!query(element, 'image')
  const hasFormula = !!query(element, 'formula')
  const hasContent = renderChildNodes(element).length > 0
  const { t } = useExamTranslation()

  return (
    <div
      className={classNames(className, {
        'has-images': hasImages,
        'has-formula': hasFormula
      })}
      style={style}
    >
      <div className="option-content">
        {!hasContent ? <i style={{ color: 'grey' }}>{t('dnd-answers.answer-missing')}</i> : renderChildNodes(element)}
      </div>
    </div>
  )
}
