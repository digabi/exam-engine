import React, { useContext } from 'react'
import { createRenderChildNodes, ExamComponentProps, RenderOptions } from '../createRenderChildNodes'
import { findChildElement, query, queryAncestors } from '../dom-utils'
import { useExamTranslation } from '../i18n'
import { tocSectionTitleId, tocTitleId } from '../ids'
import { url } from '../url'
import AnsweringInstructions from './AnsweringInstructions'
import { CommonExamContext } from './CommonExamContext'
import { QuestionContext, withQuestionContext } from './QuestionContext'
import { SectionContext, withSectionContext } from './SectionContext'

function TOCSection({ element }: ExamComponentProps) {
  const { maxAnswers, minAnswers, displayNumber, childQuestions } = useContext(SectionContext)
  const sectionTitle = findChildElement(element, 'section-title')

  return (
    <li>
      {sectionTitle && (
        <TOCSectionTitle
          {...{
            element: sectionTitle,
            displayNumber,
            maxAnswers,
            minAnswers,
            childQuestions,
          }}
        />
      )}
      <ol className="e-list-data e-pad-l-0" aria-labelledby={sectionTitle && tocSectionTitleId(displayNumber)}>
        {renderChildNodes(element, RenderOptions.SkipHTML)}
      </ol>
    </li>
  )
}

export interface TOCSectionTitleProps {
  element: Element
  displayNumber: string
  maxAnswers?: number
  minAnswers?: number
  childQuestions: Element[]
}

function TOCSectionTitle({ element, displayNumber, minAnswers, maxAnswers, childQuestions }: TOCSectionTitleProps) {
  const { numberOfSections } = useContext(CommonExamContext)
  const { t } = useExamTranslation()
  return (
    <>
      <header className="e-semibold" id={tocSectionTitleId(displayNumber)}>
        {element.hasChildNodes() && (
          <>
            {numberOfSections > 1 && t('section', { displayNumber })} {renderChildNodes(element)}
          </>
        )}
      </header>
      {maxAnswers != null && (
        <div>
          <AnsweringInstructions {...{ maxAnswers, minAnswers, childQuestions, type: 'toc-section' }} />
        </div>
      )}
    </>
  )
}

function TOCQuestion({ element }: ExamComponentProps) {
  const { attachmentsURL } = useContext(CommonExamContext)
  const { level, displayNumber, maxScore } = useContext(QuestionContext)
  const { t } = useExamTranslation()
  const externalMaterial = query(element, 'external-material')
  const questionTitle = findChildElement(element, 'question-title')

  return level === 0 ? (
    <li data-list-number={displayNumber + '.'}>
      <div className="e-columns">
        {questionTitle && (
          <span className="e-column">
            <a href={url('', { hash: displayNumber })}>{renderChildNodes(questionTitle)}</a>
          </span>
        )}
        {externalMaterial && (
          <span className="e-column e-column--narrow">
            <a
              href={url(attachmentsURL, {
                hash: queryAncestors(externalMaterial, 'question')!.getAttribute('display-number')!,
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
    </li>
  ) : null
}

const renderChildNodes = createRenderChildNodes({
  section: withSectionContext(TOCSection),
  question: withQuestionContext(TOCQuestion),
})

function TableOfContents(_props: ExamComponentProps) {
  const { root, maxScore } = useContext(CommonExamContext)
  const { t } = useExamTranslation()

  return (
    <nav className="table-of-contents e-mrg-b-6" aria-labelledby={tocTitleId}>
      <h2 id={tocTitleId}>{t('toc-heading')}</h2>
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

export default React.memo(TableOfContents)
