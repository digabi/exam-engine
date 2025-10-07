import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext } from 'react'
import { useSelector } from 'react-redux'
import { findChildElement } from '../../../dom-utils'
import { useExamTranslation } from '../../../i18n'
import { AnswerTooLong, ExtraAnswer, ValidationError } from '../../../validateAnswers'
import AnsweringInstructions from '../../AnsweringInstructions'
import { CommonExamContext } from '../../context/CommonExamContext'
import { AnswersState } from '../../../store/answers/reducer'
import classNames from 'classnames'

const ExtraAnswerError: React.FunctionComponent<ExtraAnswer> = props => {
  const { t } = useExamTranslation()
  const { displayNumber, elementType } = props
  return (
    <div>
      {elementType !== 'exam' && elementType !== 'toc-section'
        ? t(elementType, { displayNumber }) || <FallbackTitle {...props} />
        : ''}{' '}
      {<AnsweringInstructions {...props} />}
    </div>
  )
}

const AnswerTooLongError: React.FunctionComponent<AnswerTooLong> = ({ displayNumber, characterCount }) => {
  const { t } = useExamTranslation()
  return (
    <div>
      {t('question', { displayNumber })} {t('answer-errors.answer-too-long', { count: characterCount })}
    </div>
  )
}
export function ErrorIndicatorForErrors({
  validationErrors,
  inExam
}: {
  validationErrors: ValidationError[]
  inExam: boolean
}) {
  return validationErrors.length > 0 ? (
    <dialog
      open
      className={classNames(
        { 'error-indicator-in-exam e-bg-color-error e-color-off-white': inExam, 'e-font-size-xs': inExam },
        'error-indicator e-columns e-columns--inline  e-pad-1 e-mrg-r-1'
      )}
      role="alert"
    >
      <div className="e-column e-color-off-white e-column--narrow">
        <FontAwesomeIcon size="lg" icon={faExclamationTriangle} fixedWidth className="e-mrg-r-1" />
      </div>
      <div className="e-column e-column--gapless">
        {validationErrors.map(validationError => {
          const key = validationError.type + validationError.displayNumber
          switch (validationError.type) {
            case 'ExtraAnswer':
              return <ExtraAnswerError {...{ ...validationError, key }} />
            default:
              return <AnswerTooLongError {...{ ...validationError, key }} />
          }
        })}
      </div>
    </dialog>
  ) : null
}
const ErrorIndicator: React.FunctionComponent = () => {
  const validationErrors = useSelector((state: { answers: AnswersState }) => state.answers.validationErrors)
  return <ErrorIndicatorForErrors validationErrors={validationErrors} inExam={true} />
}

const FallbackTitle: React.FunctionComponent<ExtraAnswer> = ({ elementType, displayNumber }) => {
  // Hack. M/N exams have set the section translation title to an empty string,
  // so they can hide the "Osa 1:" text within the exam. In these cases, display
  // the text content of the corresponding <e:section-title> instead. Hopefully
  // we can delete this code on some day. 💩
  if (elementType === 'section') {
    const { root } = useContext(CommonExamContext)
    const section = findChildElement(
      root,
      e => e.localName === 'section' && e.getAttribute('display-number') === displayNumber
    )
    if (section) {
      const sectionTitle = findChildElement(section, 'section-title')
      if (sectionTitle) {
        return <>{`${sectionTitle.textContent.trim()}:`}</>
      }
    }
  }
  return null
}

export default React.memo(ErrorIndicator)
