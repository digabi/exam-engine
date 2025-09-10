import React, { useContext } from 'react'
import { useExamTranslation } from '../../i18n'
import { ExamContext } from '../context/ExamContext'
import { ExamServerAPI } from '../../types/ExamServerAPI'

function GoToExamineAnswersButton() {
  const { examServerApi } = useContext(ExamContext)
  const { examineExam }: ExamServerAPI = examServerApi
  const { t } = useExamTranslation()

  const goToInspectAnswers = () => {
    if (!examineExam) {
      return
    }
    examineExam()
  }

  return (
    <button
      className="e-button goto-examine-answers"
      onClick={goToInspectAnswers}
      aria-describedby="examineExamInstructions"
    >
      {t('examine-exam.examine')}
    </button>
  )
}

export default React.memo(GoToExamineAnswersButton)
