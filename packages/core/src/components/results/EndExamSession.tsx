import React, { useState } from 'react'
import { useExamTranslation } from '../../i18n'

export const EndExamSession = ({ endSession }: { endSession: () => Promise<void> }) => {
  const [examEnded, setExamEnded] = useState<boolean>(false)
  const { t } = useExamTranslation()

  const endExam = async () => {
    await endSession()
    const elements = document.querySelectorAll('main > *:not(.e-logout-container)')
    elements.forEach(el => {
      const element = el as HTMLElement
      element.style.height = `${element.clientHeight}px`
      element.classList.add('e-hidden')
      setExamEnded(true)
      setTimeout(() => {
        element.style.height = '0'
      }, 50)
    })

    const main = document.querySelector('main') as HTMLElement
    main.style.minHeight = 'calc(100% - 125px)'

    setTimeout(() => {
      const sections = document.querySelectorAll('.e-section')
      sections.forEach.call(sections, section => {
        section.parentNode?.removeChild(section)
      })
    }, 2000)
  }

  return (
    <div className="e-logout-container">
      <div className="e-bg-color-off-white e-pad-6 shadow-box">
        {examEnded ? (
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
        {!examEnded && (
          <button className="e-button" onClick={() => void endExam()}>
            Päätä koe
          </button>
        )}
      </div>
    </div>
  )
}
