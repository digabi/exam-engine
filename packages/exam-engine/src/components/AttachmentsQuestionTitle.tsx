import React, { useContext } from 'react'
import { Translation } from 'react-i18next'
import { QuestionContext } from './QuestionContext'
import { ExamComponentProps } from './types'

function AttachmentsQuestionTitle({ element, renderChildNodes }: ExamComponentProps) {
  const { displayNumber, hasExternalMaterial } = useContext(QuestionContext)

  return hasExternalMaterial ? (
    <h2 id={displayNumber + '-title'}>
      <Translation>{t => t('question', { displayNumber })}</Translation> {renderChildNodes(element)}
    </h2>
  ) : null
}

export default React.memo(AttachmentsQuestionTitle)
