import React, { useContext, useEffect } from 'react'
import { I18nextProvider, Translation } from 'react-i18next'
import { createRenderChildNodes } from '../createRenderChildNodes'
import { findChildElement, NBSP } from '../dom-utils'
import { initI18n } from '../i18n'
import { scrollToHash } from '../scrollToHash'
import AttachmentsExternalMaterial from './AttachmentsExternalMaterial'
import AttachmentsQuestion from './AttachmentsQuestion'
import AttachmentsQuestionTitle from './AttachmentsQuestionTitle'
import { CommonExamContext, withCommonExamContext } from './CommonExamContext'
import DocumentTitle from './DocumentTitle'
import { ExamProps } from './Exam'
import { withExamContext } from './ExamContext'
import RenderChildNodes from './RenderChildNodes'
import Section from './Section'
import { withSectionContext } from './SectionContext'
import RenderExamElements from './RenderExamElements'
import { examTitleId } from './ids'

const renderChildNodes = createRenderChildNodes({
  'audio-group': RenderExamElements,
  'external-material': AttachmentsExternalMaterial,
  'question-title': AttachmentsQuestionTitle,
  question: AttachmentsQuestion,
  section: withSectionContext(RenderChildNodes),
})

function Attachments(_props: ExamProps) {
  const { root, language, date, dateTimeFormatter, resolveAttachment } = useContext(CommonExamContext)

  const examTitle = findChildElement(root, 'exam-title')!
  const examStylesheet = root.getAttribute('exam-stylesheet')
  const externalMaterial = findChildElement(root, 'external-material')

  const i18n = initI18n(language, root.getAttribute('exam-code'), root.getAttribute('day-code'))
  useEffect(scrollToHash, [])

  return (
    <I18nextProvider i18n={i18n}>
      <main className="e-exam attachments">
        <React.StrictMode />
        {examStylesheet && <link rel="stylesheet" href={resolveAttachment(examStylesheet)} />}
        <Section aria-labelledby={examTitleId}>
          {examTitle && (
            <DocumentTitle id={examTitleId}>
              <Translation>{(t) => t('attachments-page-title')}</Translation>
              {NBSP}
              {renderChildNodes(examTitle)}
            </DocumentTitle>
          )}
          <div className="e-semibold e-mrg-b-6">{dateTimeFormatter.format(date)}</div>
          {externalMaterial && (
            <AttachmentsExternalMaterial {...{ element: externalMaterial, renderChildNodes, forceRender: true }} />
          )}
        </Section>
        {renderChildNodes(root)}
      </main>
    </I18nextProvider>
  )
}

export default React.memo(withExamContext(withCommonExamContext(Attachments)))
