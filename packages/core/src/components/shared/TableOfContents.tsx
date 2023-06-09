import React, { useContext } from 'react'
import { createRenderChildNodes, ExamComponentProps, RenderOptions } from '../../createRenderChildNodes'
import { findChildElement, getAttribute, query, queryAncestors } from '../../dom-utils'
import { useExamTranslation } from '../../i18n'
import { tocSectionTitleId, tocTitleId } from '../../ids'
import { url } from '../../url'
import AnsweringInstructions from '../AnsweringInstructions'
import { CommonExamContext } from '../context/CommonExamContext'
import { QuestionContext, withQuestionContext } from '../context/QuestionContext'
import { SectionContext, withSectionContext } from '../context/SectionContext'

export const mkTableOfContents = (options: {
  showAttachmentLinks: boolean
  showAnsweringInstructions: boolean
  toggleSidebarNavi?: () => void
  isInSideBar?: boolean
}) => {
  const { showAttachmentLinks, showAnsweringInstructions, toggleSidebarNavi, isInSideBar } = options

  const TOCSectionTitle: React.FunctionComponent<ExamComponentProps> = ({ element }) => {
    const { sections } = useContext(CommonExamContext)
    const { childQuestions, displayNumber, minAnswers, maxAnswers } = useContext(SectionContext)
    const { t } = useExamTranslation()
    return (
      <>
        {element.hasChildNodes() && (
          <h4 className="toc-section-header" id={tocSectionTitleId(displayNumber)}>
            {sections.length > 1 && t('section', { displayNumber })} {renderChildNodes(element)}
          </h4>
        )}
        {showAnsweringInstructions && maxAnswers != null && (
          <div>
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
    const { displayNumber, maxScore } = useContext(QuestionContext)
    const { t } = useExamTranslation()

    const questionTitle = findChildElement(element, 'question-title')!
    const externalMaterial = showAttachmentLinks && displayNumber != null && query(element, 'external-material')

    return (
      <li data-list-number={`${displayNumber}.`}>
        <div className="e-columns">
          <span className="e-column">
            <a href={url('', { hash: displayNumber })}>
              <span className="question-number">{displayNumber}</span>
              <span className="question-title">{renderChildNodes(questionTitle)}</span>
            </a>
          </span>
          {externalMaterial && (
            <span className="e-column e-column--narrow">
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
        </div>
        <ul className="sub-questions">{renderChildNodes(element)}</ul>
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

    return (
      <nav className="table-of-contents" aria-labelledby={tocTitleId}>
        <h2 id={tocTitleId}>
          {t('toc-heading')}
          <button className="toggle-navi e-link-button" onClick={toggleSidebarNavi}>
            {isInSideBar ? 'Palauta sisällys kokeeseen →' : '← Kiinnitä sisällys reunaan'}
          </button>
        </h2>
        <ol className="e-list-plain e-pad-l-0">{renderChildNodes(root)}</ol>
        <div className="e-columns">
          <strong className="e-column">{t('exam-total')}</strong>
          <strong className="e-column e-column--narrow table-of-contents--score-column">
            {t('points', { count: maxScore })}
          </strong>
        </div>
      </nav>
    )
  }

  return React.memo(TableOfContents)
}
