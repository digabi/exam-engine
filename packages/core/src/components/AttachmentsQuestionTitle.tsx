import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { QuestionContext } from './QuestionContext'
import { ExamComponentProps } from './types'

function AttachmentsQuestionTitle({ element, renderChildNodes }: ExamComponentProps) {
  const { displayNumber, hasExternalMaterial } = useContext(QuestionContext)
  const { t } = useTranslation()

  return hasExternalMaterial ? (
    <h2 id={displayNumber + '-title'}>
      {t('question', { displayNumber })}. {renderChildNodes(element)}
    </h2>
  ) : null
}

export default React.memo(AttachmentsQuestionTitle)
