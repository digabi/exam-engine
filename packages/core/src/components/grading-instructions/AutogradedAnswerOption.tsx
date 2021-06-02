import React from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { getNumericAttribute } from '../../dom-utils'
import { useExamTranslation } from '../../i18n'

const AutogradedAnswerOption: React.FunctionComponent<ExamComponentProps> = ({ element, renderChildNodes }) => {
  const score = getNumericAttribute(element, 'score')
  if (!score) return null

  const { t } = useExamTranslation()

  return (
    <li>
      {renderChildNodes(element)} ({t('points', { count: score })})
    </li>
  )
}

export default AutogradedAnswerOption
