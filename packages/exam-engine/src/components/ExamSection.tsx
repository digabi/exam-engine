import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { AppState } from '../store'
import { allowCas, allowCasCancelled } from '../store/cas/actions'
import { CasState } from '../store/cas/reducer'
import { casCountdownDurationSeconds } from '../store/cas/sagas'
import ProgressBar from './ProgressBar'
import Section from './Section'
import { SectionContext, withSectionContext } from './SectionContext'
import { ExamComponentProps } from './types'

function ExamSection({ element, renderChildNodes }: ExamComponentProps) {
  const casState = useSelector((state: AppState) => state.cas, shallowEqual)
  const { casForbidden, displayNumber } = useContext(SectionContext)

  return (
    <Section className="exam-section" aria-labelledby={displayNumber + '-title'}>
      {renderChildNodes(element)}
      {casForbidden && <CasControls {...casState} />}
    </Section>
  )
}

function CasControls(props: CasState) {
  const dispatch = useDispatch()
  const { t } = useTranslation()

  return (
    <div className="e-cas-controls">
      {props.casStatus === 'forbidden' ? (
        <div className="e-text-center">
          <hr className="e-exam-separator" />
          <p>{t('cas.forbidden.infoText')}</p>
          <button className="e-button" id="allow-cas" onClick={() => dispatch(allowCas())}>
            {t('cas.forbidden.buttonText')}
          </button>
        </div>
      ) : props.casStatus === 'allowing' ? (
        <div className="e-text-center">
          <hr className="e-exam-separator" />
          <p>{t('cas.allowing.infoText')}</p>
          <ProgressBar className="e-mrg-b-2" duration={casCountdownDurationSeconds} />
          <button className="e-button" id="allow-cas-cancelled" onClick={() => dispatch(allowCasCancelled())}>
            {t('cas.allowing.buttonText', { count: props.durationRemaining })}
          </button>
        </div>
      ) : (
        <div className="notification e-text-left e-mrg-b-0">{t('cas.allowed.infoText')}</div>
      )}
    </div>
  )
}

export default React.memo(withSectionContext(ExamSection))
