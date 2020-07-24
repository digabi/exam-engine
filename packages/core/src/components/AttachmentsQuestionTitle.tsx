import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { QuestionContext } from './QuestionContext'
import { ExamComponentProps } from '../createRenderChildNodes'
import { questionTitleId } from '../ids'

function AttachmentsQuestionTitle({ element, renderChildNodes }: ExamComponentProps) {
  const { displayNumber, hasExternalMaterial } = useContext(QuestionContext)
  const { t } = useTranslation()

  return hasExternalMaterial ? (
    <h2 id={questionTitleId(displayNumber)}>
      {t('question', { displayNumber })}. {renderChildNodes(element)}
    </h2>
  ) : null
}

export default React.memo(AttachmentsQuestionTitle)
