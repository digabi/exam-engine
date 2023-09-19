import React from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { useExamTranslation } from '../../i18n'

function ExamTranslation({ element }: ExamComponentProps) {
  const { t } = useExamTranslation()
  const key = element.getAttribute('key')!

  return <>{t(key)}</>
}

export default React.memo(ExamTranslation)
