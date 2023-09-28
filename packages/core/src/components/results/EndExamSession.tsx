import React from 'react'
import { useExamTranslation } from '../../i18n'

interface Props {
  onEndSession: () => Promise<void>
  sessionEnded: boolean
}

export const EndExamSession = ({ onEndSession, sessionEnded }: Props) => {
  const { t } = useExamTranslation()

  return (
    <div className="e-logout-container">
      <div className="e-bg-color-off-white e-pad-6 shadow-box">
        {sessionEnded ? (
          <>
            <h3>{t('examineExam.thankYouTitle')}</h3>
            <p>
              {t('examineExam.shutdownComputer')}
              <br />
              {t('examineExam.returnUsbStick')}
            </p>
          </>
        ) : (
          <>
            <h3>{t('examineExam.endExamTitle')}</h3>
            <p>
              {t('examineExam.afterInspectingYourAnswers')}
              <br />
              {t('examineExam.youCanNotReturnToExam')}
            </p>
          </>
        )}
        {!sessionEnded && (
          <button id="endSession" className="e-button" onClick={() => void onEndSession()}>
            Päätä koe
          </button>
        )}
      </div>
    </div>
  )
}
