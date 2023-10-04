import React, { useContext } from 'react'
import SectionElement from '../SectionElement'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { ExamContext } from '../context/ExamContext'
import { useExamTranslation } from '../../i18n'

function ExamFooter({ element, renderChildNodes }: ExamComponentProps) {
  const { examServerApi } = useContext(ExamContext)
  const { finishExam } = examServerApi
  const { t } = useExamTranslation()

  return (
    <SectionElement>
      <div className="e-exam-footer">
        {renderChildNodes(element)}

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
    </SectionElement>
  )
}

export default React.memo(ExamFooter)
