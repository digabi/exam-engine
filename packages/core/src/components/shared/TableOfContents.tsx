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
import { useSelector } from 'react-redux'
import { AnswersState } from '../../store/answers/reducer'
import classNames from 'classnames'

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
    return (
      <>
        {element.hasChildNodes() && (
          <h4 className="toc-section-header" id={tocSectionTitleId(displayNumber)}>
            {sections.length > 1 && t('section', { displayNumber })}
            {renderChildNodes(element)}
          </h4>
        )}
        {showAnsweringInstructions && maxAnswers != null && (
          <div className="answer-instructions">
            <AnsweringInstructions {...{ maxAnswers, minAnswers, childQuestions, elementType: 'toc-section' }} />
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
              renderChildNodes
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

    const questionId = Number(element.querySelector('[question-id]')?.getAttribute('question-id'))

    const answersById = useSelector((state: { answers: AnswersState }) => state.answers.answersById)
    const answer = useSelector((state: { answers: AnswersState }) => state.answers.answersById[questionId])

    const questionTitle = findChildElement(element, 'question-title')!
    const externalMaterial = showAttachmentLinks && displayNumber != null && query(element, 'external-material')

    const subQuestions = element.querySelectorAll('[question-id]')
    const subQuestionIds = [] as { id: number; type: string; maxLength?: number }[]

    subQuestions.forEach((e) => {
      const id = Number(e.getAttribute('question-id'))
      const type = e.getAttribute('type') || ''
      const maxLength = Number(e.getAttribute('max-length'))

      if (id) {
        subQuestionIds.push({ id, type, maxLength })
      }
    })

    const allSubquestionsAreAnswered = subQuestionIds.every((i) => answersById[i.id])
    const hasSubQuestions = element.hasChildNodes()
    const answered = answer?.value && (!hasSubQuestions || allSubquestionsAreAnswered)

    return (
      <li
        data-list-number={`${displayNumber}.`}
        onClick={() => (isInSidebar ? (window.location.href = `#${displayNumber}`) : undefined)}
        className={`level-${level}`}
      >
        <span className="e-column e-number-and-title">
          <a href={url('', { hash: displayNumber })}>
            <span className="question-number">{displayNumber}</span>
            {questionTitle && <span className="question-title">{renderChildNodes(questionTitle)}</span>}
          </a>
        </span>
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
        {isInSidebar && level === 0 && (
          <span className="e-column e-column--narrow e-external-material">
            {externalMaterial && (
              <a
                href={url(attachmentsURL, {
                  hash: getAttribute(queryAncestors(externalMaterial, 'question')!, 'display-number')
                })}
                target="attachments"
              >
                <FontAwesomeIcon size="sm" icon={faPaperclip} fixedWidth />
              </a>
            )}
          </span>
        )}
        <div className={classNames('answers', { answered })}>
          {subQuestionIds.map((i) => {
            const answer = answersById[i.id]
            const type = answer?.type
            const answerIsFormula = answer?.value.includes('math.svg')
            const answerIsImage = answer?.value.includes('data:image')
            const textType = type === 'richText' || type === 'text'
            console.log(displayNumber, answer)
            return (
              <div
                key={i.id}
                className={classNames('q', {
                  ok: answersById[i.id]?.value,
                  [type]: type,
                  tooLong: textType && i.maxLength && answer?.characterCount > i.maxLength,
                  big: i.type === 'rich-text',
                })}
              >
                {type === 'richText' &&
                  (answerIsFormula ? '∑' : answerIsImage ? 'img' : !!answer?.characterCount && answer.characterCount)}
              </div>
            )
          })}
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

    return (
      <nav className="table-of-contents" aria-labelledby={tocTitleId}>
        <h2 id={tocTitleId}>
          <span className="e-toc-heading">{t('toc-heading')}</span>
        </h2>

        {maxAnswers && <div className="max-answers">Vastaa enintään {maxAnswers} tehtävään</div>}

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
