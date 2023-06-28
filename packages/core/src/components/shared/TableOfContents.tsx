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

export const mkTableOfContents = (options: {
  showAttachmentLinks: boolean
  showAnsweringInstructions: boolean
  isInSidebar?: boolean
  answers: AnswersState
}) => {
  const { showAttachmentLinks, showAnsweringInstructions, isInSidebar, answers } = options

  const TOCSectionTitle: React.FunctionComponent<ExamComponentProps> = ({ element }) => {
    const { sections } = useContext(CommonExamContext)
    const { childQuestions, displayNumber, minAnswers, maxAnswers } = useContext(SectionContext)
    const { t } = useExamTranslation()

    const hasSectionValidationErrors = answers.validationErrors?.find(
      (i) => i.displayNumber === displayNumber && i?.elementType === 'section'
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

        {showAnsweringInstructions && maxAnswers != null && (
          <div style={{ display: 'grid' }}>
            <div className={classNames('answer-instructions', { error: hasSectionValidationErrors })}>
              {hasSectionValidationErrors && <div className="error-mark">!</div>}
              <AnsweringInstructions {...{ maxAnswers, minAnswers, childQuestions, elementType: 'toc-section' }} />
            </div>
          </div>
        )}
      </>
    )
  }

  const TOCSection: React.FunctionComponent<ExamComponentProps> = ({ element, renderChildNodes }) => {
    const { displayNumber } = useContext(SectionContext)
    const sectionTitle = findChildElement(element, 'section-title')

    return (
      <li>
        {sectionTitle && (
          <TOCSectionTitle
            {...{
              element: sectionTitle,
              renderChildNodes,
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

    const answersById = answers?.answersById || {}
    const subquestionNodes = element.querySelectorAll('[question-id]')
    const subquestions = [] as { id: number; type: string; error: boolean }[]

    const questionValidationErrors = answers.validationErrors?.filter((i) => i?.elementType === 'question')

    const hasQuestionValidationError = !!questionValidationErrors?.find((i) => i.displayNumber === displayNumber)

    subquestionNodes.forEach((e) => {
      const id = Number(e.getAttribute('question-id'))
      const type = e.getAttribute('type') || ''
      const subQuestionDisplayNumber = e.getAttribute('display-number') || ''
      const error = !!questionValidationErrors?.find((i) => i.displayNumber === subQuestionDisplayNumber)

      if (id) {
        subquestions.push({ id, type, error })
      }
    })

    const subQuestionError = !!subquestions.find((i) => i.error)
    const maxAnswers = Number(element.getAttribute('max-answers'))

    const subquestionsAnswered = subquestions?.filter((i) => answersById[i.id]?.value).length
    const requiredAnswers = maxAnswers || subquestions.length

    return (
      <li
        data-list-number={`${displayNumber}.`}
        onClick={() => (isInSidebar ? (window.location.href = `#${displayNumber}`) : undefined)}
        className={`level-${level} ${hasQuestionValidationError ? 'error' : ''}`}
      >
        <span className="e-column e-number-and-title">
          <a href={url('', { hash: displayNumber })}>
            <span className="question-number">{displayNumber}</span>
            {questionTitle && <span className="question-title">{renderChildNodes(questionTitle)}</span>}
          </a>
        </span>

        <div
          className={classNames('numeric-answer-indicator', {
            error: subQuestionError,
            ok: subquestionsAnswered === requiredAnswers,
          })}
        >
          {subquestionsAnswered}/{requiredAnswers}
        </div>

        {!isInSidebar && externalMaterial && (
          <span className="e-column e-column--narrow e-external-material">
            <a
              href={url(attachmentsURL, {
                hash: getAttribute(queryAncestors(externalMaterial, 'question')!, 'display-number'),
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
            {externalMaterial && (
              <a
                href={url(attachmentsURL, {
                  hash: getAttribute(queryAncestors(externalMaterial, 'question')!, 'display-number'),
                })}
                target="attachments"
              >
                <FontAwesomeIcon size="sm" icon={faPaperclip} fixedWidth />
              </a>
            )}
          </span>
        )}

        <div className="answers">
          {subquestions.map((i) => (
            <Indicator key={i.id} type={i.type} id={i.id} answer={answersById[i.id]} error={i.error} />
          ))}{' '}
        </div>
      </li>
    )
  }

  const renderChildNodes = createRenderChildNodes({
    section: withSectionContext(TOCSection),
    question: withQuestionContext(TOCQuestion),
  })

  const TableOfContents: React.FunctionComponent<ExamComponentProps> = () => {
    const { root, maxScore } = useContext(CommonExamContext)
    const { t } = useExamTranslation()
    const maxAnswers = getNumericAttribute(root, 'max-answers')

    const hasExamValidationErrors = answers.validationErrors?.find((i) => i?.elementType === 'exam')

    return (
      <nav className="table-of-contents" aria-labelledby={tocTitleId}>
        <h2 id={tocTitleId}>
          <span className="e-toc-heading">{t('toc-heading')}</span>
        </h2>

        {maxAnswers && (
          <div style={{ display: 'grid' }}>
            <div className={classNames('answer-instructions', { error: !!hasExamValidationErrors })}>
              {hasExamValidationErrors && <div className="error-mark">!</div>}
              Vastaa enintään {maxAnswers} tehtävään
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
