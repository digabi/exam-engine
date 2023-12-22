import React, { useContext } from 'react'
import { useExamTranslation } from '../../i18n'
import { ExamContext } from '../context/ExamContext'
import { ExamServerAPI } from '../../types/ExamServerAPI'

function ExamineExam() {
  const { examServerApi } = useContext(ExamContext)
  const { examineExam, finishExam }: ExamServerAPI = examServerApi
  const { t } = useExamTranslation()

  const goToInspectAnswers = () => {
    if (!examineExam && !finishExam) {
      return
    }
    if (examineExam) {
      examineExam()
    } else if (finishExam) {
      finishExam()
    }
    window.scrollTo(0, 0)
  }

  return (
    <div className="e-examine-exam">
      <button
        className="e-button"
        id="examineExam"
        onClick={goToInspectAnswers}
        aria-describedby="examineExamInstructions"
      >
        {t('examine-exam.examine')}
      </button>
      <div className="e-examine-exam-instructions" id="examineExamInstructions">
        {t('examine-exam.instructions')}
      </div>
    </div>
  )
}

export default React.memo(ExamineExam)
