import classNames from 'classnames'
import React, { useContext } from 'react'
import { useSelector } from 'react-redux'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { useIsElementInViewport } from '../../dom-utils'
import { useExamTranslation } from '../../i18n'
import { tocSectionTitleId } from '../../ids'
import { AnswersState } from '../../store/answers/reducer'
import AnsweringInstructions from '../AnsweringInstructions'
import { CommonExamContext } from '../context/CommonExamContext'
import { SectionContext } from '../context/SectionContext'

export const TOCSectionTitle: React.FunctionComponent<ExamComponentProps> = ({ element, renderChildNodes }) => {
  const { sections } = useContext(CommonExamContext)
  const { childQuestions, displayNumber, minAnswers, maxAnswers } = useContext(SectionContext)
  const { t } = useExamTranslation()
  const isInSidebar = true
  const showAnsweringInstructions = true

  const showSectionValidationErrors =
    isInSidebar &&
    !!useSelector((state: { answers: AnswersState }) =>
      state.answers?.validationErrors?.find(i => i.displayNumber === displayNumber && i?.elementType === 'section')
    )

  const isVisible = useIsElementInViewport('section', displayNumber)

  return (
    <div className={isVisible ? 'isVisible' : ''}>
      {element.hasChildNodes() && (
        <div className="toc-section-header-container">
          <h4 className="toc-section-header" id={tocSectionTitleId(displayNumber)}>
            {sections.length > 1 && t('section', { displayNumber })} {renderChildNodes(element)}
          </h4>
        </div>
      )}

      {showAnsweringInstructions && maxAnswers && (
        <div style={{ display: 'grid' }} className={`answer-instructions-container section-${displayNumber}`}>
          <div
            className={classNames('answer-instructions', {
              error: showSectionValidationErrors
            })}
          >
            {showSectionValidationErrors && <div className="error-mark">!</div>}
            <span className="error-reason">
              <AnsweringInstructions {...{ maxAnswers, minAnswers, childQuestions, elementType: 'toc-section' }} />
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
