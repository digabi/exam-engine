import React, { useContext } from 'react'
import { useExamTranslation } from '../../i18n'
import { ExamContext } from '../context/ExamContext'

function FinishExam() {
  const { examServerApi } = useContext(ExamContext)
  const { finishExam } = examServerApi
  const { t } = useExamTranslation()

  return (
    <div className="e-finish-exam">
      {finishExam !== undefined && (
        <>
          <button id="finishExam" onClick={() => void finishExam()} aria-describedby="finishExamInstructions">
            {t('finish-exam.finish')}
          </button>
          <div className="e-finish-exam-instructions" id="finishExamInstructions">
            {t('finish-exam.instructions')}
          </div>
        </>
      )}
    </div>
  )
}

export default React.memo(FinishExam)
