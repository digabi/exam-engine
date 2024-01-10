import React, { useContext } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { useExamTranslation } from '../../i18n'
import { sectionTitleId } from '../../ids'
import { allowCas, allowCasCancelled } from '../../store/cas/actions'
import { CasState } from '../../store/cas/reducer'
import { ExamContext } from '../context/ExamContext'
import ProgressBar from './internal/ProgressBar'
import SectionElement from '../SectionElement'
import { SectionContext, withSectionContext } from '../context/SectionContext'
import { CommonExamContext } from '../context/CommonExamContext'
import * as _ from 'lodash-es'
import GoToExamineAnswersButton from './GoToExamineAnswersButton'

function LastSectionNote() {
  const { t } = useExamTranslation()
  return (
    <p>
      <em>{t('end-of-exam')}</em>
    </p>
  )
}

function Section({ element, renderChildNodes }: ExamComponentProps) {
  const casState = useSelector((state: { cas: CasState }) => state.cas, shallowEqual)
  const { casForbidden, displayNumber } = useContext(SectionContext)
  const { sections } = useContext(CommonExamContext)
  const lastSection = element === _.last(sections)

  return (
    <SectionElement className="exam-section" aria-labelledby={sectionTitleId(displayNumber)}>
      {renderChildNodes(element)}
      {casForbidden && <CasControls {...casState} />}
      {lastSection && <LastSectionNote />}
    </SectionElement>
  )
}

function CasControls(props: CasState) {
  const dispatch = useDispatch()
  const { t } = useExamTranslation()
  const { casCountdownDuration } = useContext(ExamContext)

  return (
    <div className="e-cas-controls">
      {props.casStatus === 'forbidden' ? (
        <div className="e-text-center">
          <hr className="e-exam-separator" />
          <p>
            {t('cas.examineSectionA')}
            <br />
            {t('cas.cannotEditLater')}
          </p>
          <GoToExamineAnswersButton />
          <p>{t('cas.youCanReturn')}</p>
          <p className="dots-separator">•••</p>
          <p id="e-cas-controls-forbidden-description">{t('cas.forbidden.infoText')}</p>
          <button
            className="e-button"
            id="allow-cas"
            onClick={() => dispatch(allowCas(casCountdownDuration))}
            aria-describedby="e-cas-controls-forbidden-description"
          >
            {t('cas.forbidden.buttonText')}
          </button>
        </div>
      ) : props.casStatus === 'allowing' ? (
        <div
          className="e-text-center"
          ref={e => e != null && casCountdownDuration === props.durationRemaining && e.scrollIntoView()}
        >
          <hr className="e-exam-separator" />
          <p id="e-cas-controls-allowing-description">{t('cas.allowing.infoText')}</p>
          <ProgressBar
            className="e-mrg-b-2"
            duration={casCountdownDuration}
            durationRemaining={props.durationRemaining}
          />
          <button
            className="e-button"
            id="allow-cas-cancelled"
            onClick={() => dispatch(allowCasCancelled())}
            ref={e => e != null && casCountdownDuration === props.durationRemaining && e.focus()}
            aria-describedby="e-cas-controls-allowing-description"
          >
            {t('cas.allowing.cancel', { count: props.durationRemaining })}
          </button>
        </div>
      ) : (
        <div className="notification e-text-left e-mrg-b-0">{t('cas.allowed.infoText')}</div>
      )}
    </div>
  )
}

export default React.memo(withSectionContext(Section))
