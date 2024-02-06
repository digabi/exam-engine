import React, { useContext } from 'react'
import { createRenderChildNodes, ExamComponentProps, RenderOptions } from '../../createRenderChildNodes'
import { findChildElement, getAttribute, getNumericAttribute, query, queryAncestors } from '../../dom-utils'
import { useExamTranslation } from '../../i18n'
import { tocSectionTitleId, tocTitleId } from '../../ids'
import { url } from '../../url'
import AnsweringInstructions from '../AnsweringInstructions'
import { CommonExamContext } from '../context/CommonExamContext'
import { QuestionContext, withQuestionContext } from '../context/QuestionContext'
import { SectionContext, withSectionContext } from '../context/SectionContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperclip } from '@fortawesome/free-solid-svg-icons'
import { AnswersState } from '../../store/answers/reducer'
import classNames from 'classnames'
import { Indicator } from './AnswerIndicator'
import { useSelector } from 'react-redux'
import { ExamAnswer, QuestionId } from '../../types/ExamAnswer'

export const mkTableOfContents = (options: {
  showAttachmentLinks: boolean
  showAnsweringInstructions: boolean
  isInSidebar?: boolean
}) => {
  const { showAttachmentLinks, showAnsweringInstructions, isInSidebar } = options

  const TOCSectionTitle: React.FunctionComponent<ExamComponentProps> = ({ element }) => {
    const { sections } = useContext(CommonExamContext)
    const { childQuestions, displayNumber, minAnswers, maxAnswers } = useContext(SectionContext)
    const { t } = useExamTranslation()

    const showSectionValidationErrors =
      isInSidebar &&
      !!useSelector((state: { answers: AnswersState }) =>
        state.answers?.validationErrors?.find(i => i.displayNumber === displayNumber && i?.elementType === 'section')
      )

    return (
      <>
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
      </>
    )
  }

  const TOCSection: React.FunctionComponent<ExamComponentProps & { answers: AnswersState }> = ({
    element,
    answers,
    renderChildNodes
  }) => {
    const { displayNumber } = useContext(SectionContext)
    const sectionTitle = findChildElement(element, 'section-title')

    return (
      <li data-section-id={displayNumber}>
        {sectionTitle && (
          <TOCSectionTitle
            {...{
              element: sectionTitle,
              renderChildNodes,
              answers
            }}
          />
        )}
        <ol className="e-list-data e-pad-l-0" aria-labelledby={sectionTitle && tocSectionTitleId(displayNumber)}>
          {renderChildNodes(element, RenderOptions.SkipHTML)}
        </ol>
      </li>
    )
  }

  const TOCQuestion: React.FunctionComponent<ExamComponentProps> = ({ element }) => {
    const { attachmentsURL } = useContext(CommonExamContext)
    const { displayNumber, maxScore, level } = useContext(QuestionContext)
    const { t } = useExamTranslation()

    const questionTitle = findChildElement(element, 'question-title')!
    const externalMaterial = showAttachmentLinks && displayNumber != null && query(element, 'external-material')

    const subquestions = [] as { id: number; type: string; error: boolean; displayNumber: number }[]

    let answersById = {} as Record<QuestionId, ExamAnswer>
    let hasQuestionValidationError = false

    if (isInSidebar) {
      const answers = useSelector((state: { answers: AnswersState }) => state.answers)

      answersById = answers?.answersById || {}
      const subquestionNodes = element.querySelectorAll('[question-id]')

      const questionValidationErrors = answers.validationErrors?.filter(i => i?.elementType === 'question')
      hasQuestionValidationError = !!questionValidationErrors?.find(i => i.displayNumber === displayNumber)

      subquestionNodes.forEach(e => {
        const id = Number(e.getAttribute('question-id'))
        const type = e.getAttribute('type') || ''
        const subQuestionDisplayNumber = e.getAttribute('display-number') || ''
        const hasError = !!questionValidationErrors?.find(i => i.displayNumber === subQuestionDisplayNumber)
        const childQuestionHasError = questionValidationErrors
          .flatMap(i => ('childQuestions' in i ? i.childQuestions : []))
          .includes(subQuestionDisplayNumber)
        const hasAnswer = !!answersById[id]?.value

        if (id) {
          subquestions.push({
            id,
            type,
            error: hasError || (childQuestionHasError && hasAnswer),
            displayNumber: Number(subQuestionDisplayNumber)
          })
        }
      })
    }

    const subQuestionError = !!subquestions.find(i => i.error)
    const subquestionsAnswered = subquestions?.filter(i => answersById[i.id]?.value).length
    const maxAnswers = Number(element.getAttribute('max-answers'))
    const requiredAnswers = maxAnswers || subquestions.length

    return (
      <li
        data-list-number={`${displayNumber}.`}
        onClick={() => (isInSidebar ? (window.location.href = `#question-nr-${displayNumber}`) : undefined)}
        className={classNames(`level-${level}`, { error: hasQuestionValidationError })}
      >
        <span className="e-column e-question-title">
          <a href={url('', { hash: `question-nr-${displayNumber}` })} tabIndex={isInSidebar ? -1 : undefined}>
            <span>{renderChildNodes(questionTitle)}</span>
          </a>
        </span>

        <div
          className={classNames('numeric-answer-indicator', {
            error: subQuestionError,
            ok: subquestionsAnswered === requiredAnswers
          })}
        >
          {subquestionsAnswered}/{requiredAnswers}
        </div>

        {!isInSidebar && externalMaterial && (
          <span className="e-column e-column--narrow e-external-material">
            <a
              href={url(attachmentsURL, {
                hash: getAttribute(queryAncestors(externalMaterial, 'question')!, 'display-number')
              })}
              target="attachments"
            >
              {t('material')}
            </a>
          </span>
        )}

        <span className="e-column e-column--narrow table-of-contents--score-column">
          {t('points', { count: maxScore })}
        </span>

        {isInSidebar && (
          <span className="e-column e-column--narrow e-external-material">
            {externalMaterial && <FontAwesomeIcon size="sm" icon={faPaperclip} fixedWidth />}
          </span>
        )}

        <div className="answers">
          {subquestions.map(i => (
            <Indicator
              key={i.id}
              type={i.type}
              id={i.id}
              answer={answersById[i.id]}
              error={i.error}
              displayNumber={i.displayNumber}
            />
          ))}{' '}
        </div>
      </li>
    )
  }

  const renderChildNodes = createRenderChildNodes({
    section: withSectionContext(TOCSection),
    question: withQuestionContext(TOCQuestion)
  })

  const TableOfContents: React.FunctionComponent<ExamComponentProps> = () => {
    const { root, maxScore } = useContext(CommonExamContext)
    const { t } = useExamTranslation()
    const maxAnswers = getNumericAttribute(root, 'max-answers')

    const showExamValidationErrors =
      isInSidebar &&
      !!useSelector((state: { answers: AnswersState }) =>
        state.answers.validationErrors?.find(i => i?.elementType === 'exam')
      )

    return (
      <nav className="table-of-contents" aria-labelledby={tocTitleId}>
        {!isInSidebar && (
          <h2 id={tocTitleId}>
            <span className="e-toc-heading">{t('toc-heading')}</span>
          </h2>
        )}

        {showAnsweringInstructions && maxAnswers && (
          <div style={{ display: 'grid' }}>
            <div className={classNames('answer-instructions', { error: showExamValidationErrors })}>
              {showExamValidationErrors && <div className="error-mark exam">!</div>}
              <span className="error-reason">{t('max-answers-warning', { count: maxAnswers })}</span>
            </div>
          </div>
        )}

        <ol className="e-list-plain e-pad-l-0">{renderChildNodes(root)}</ol>
        <div className="e-columns">
          <strong className="e-column e-total">{t('exam-total')}</strong>
          <strong className="e-column e-column--narrow table-of-contents--score-column">
            {t('points', { count: maxScore })}
          </strong>
          {isInSidebar && <span className="e-column e-column--narrow e-external-material" />}
        </div>
      </nav>
    )
  }

  return React.memo(TableOfContents)
}
