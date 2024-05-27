import { faPaperclip } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import React, { useContext } from 'react'
import { useSelector } from 'react-redux'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { findChildElement, getAttribute, query, queryAncestors, useIsElementInViewport } from '../../dom-utils'
import { useExamTranslation } from '../../i18n'
import { AnswersState } from '../../store/answers/reducer'
import { ExamAnswer, QuestionId } from '../../types/ExamAnswer'
import { url } from '../../url'
import { CommonExamContext } from '../context/CommonExamContext'
import { QuestionContext } from '../context/QuestionContext'
import { Indicator } from './AnswerIndicator'
import { IsInSidebarContext } from '../context/IsInSidebarContext'

export const TOCQuestion: React.FunctionComponent<ExamComponentProps> = ({ element, renderChildNodes }) => {
  const { attachmentsURL } = useContext(CommonExamContext)
  const { displayNumber, maxScore, level } = useContext(QuestionContext)
  const { t } = useExamTranslation()
  const showAttachmentLinks = true
  const { isInSidebar } = useContext(IsInSidebarContext)

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

  const isVisible = useIsElementInViewport('question', displayNumber)

  return (
    <li
      data-list-number={`${displayNumber}.`}
      onClick={() => (isInSidebar ? (window.location.href = `#question-nr-${displayNumber}`) : undefined)}
      className={classNames(`level-${level}`, { error: hasQuestionValidationError, current: isVisible })}
    >
      <span className="e-column e-question-title">
        <a href={url('', { hash: `question-nr-${displayNumber}` })} tabIndex={isInSidebar ? -1 : undefined}>
          <span>{renderChildNodes(questionTitle)}</span>
        </a>
      </span>
      {isInSidebar && (
        <div
          className={classNames('numeric-answer-indicator', {
            error: subQuestionError,
            ok: subquestionsAnswered === requiredAnswers
          })}
        >
          {subquestionsAnswered}/{requiredAnswers}
        </div>
      )}
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
