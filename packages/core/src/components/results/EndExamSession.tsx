import React from 'react'
import { useExamTranslation } from '../../i18n'

interface Props {
  onEndSession: () => Promise<void>
  showThankYouText: boolean
}

export const EndExamSession = ({ onEndSession, showThankYouText }: Props) => {
  const { t } = useExamTranslation()

  return (
    <div className="e-logout-container">
      {showThankYouText ? 'valmis' : 'kesken'}
      <div className="e-bg-color-off-white e-pad-6 shadow-box">
        {showThankYouText ? (
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
        {!showThankYouText && (
          <button id="endSession" className="e-button" onClick={() => void onEndSession()}>
            {t('examineExam.endExamTitle')}
          </button>
        )}
      </div>
    </div>
  )
}
