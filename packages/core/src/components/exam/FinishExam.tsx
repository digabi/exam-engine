import React, { useContext } from 'react'
import { useExamTranslation } from '../../i18n'
import { ExamContext } from '../context/ExamContext'

function FinishExam() {
  const { examServerApi } = useContext(ExamContext)
  const { finishExam } = examServerApi
  const { t } = useExamTranslation()

  const goToInspectAnswers = () => {
    if (finishExam() !== undefined) {
      finishExam()
      window.scrollTo(0, 0)
    }
  }

  return (
    <div className="e-finish-exam">
      <button
        className="e-button"
        id="finishExam"
        onClick={goToInspectAnswers}
        aria-describedby="finishExamInstructions"
      >
        {t('finish-exam.finish')}
      </button>
      <div className="e-finish-exam-instructions" id="finishExamInstructions">
        {t('finish-exam.instructions')}
      </div>
    </div>
  )
}

export default React.memo(FinishExam)
