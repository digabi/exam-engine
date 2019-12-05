import React, { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { createRenderChildNodes } from '../createRenderChildNodes'
import { findChildElementByLocalName } from '../dom-utils'
import { initI18n } from '../i18n'
import { scrollToHash } from '../scrollToHash'
import AttachmentsExternalMaterial from './AttachmentsExternalMaterial'
import AttachmentsQuestion from './AttachmentsQuestion'
import AttachmentsQuestionTitle from './AttachmentsQuestionTitle'
import DocumentTitle from './DocumentTitle'
import { ExamProps } from './Exam'
import { ExamContext, withExamContext } from './ExamContext'
import RenderChildNodes from './RenderChildNodes'
import Section from './Section'
import { withSectionContext } from './SectionContext'

const renderChildNodes = createRenderChildNodes({
  'external-material': AttachmentsExternalMaterial,
  'question-title': AttachmentsQuestionTitle,
  question: AttachmentsQuestion,
  section: withSectionContext(RenderChildNodes)
})

function Attachments({}: ExamProps) {
  const { root, language, date, dateTimeFormatter, resolveAttachment } = useContext(ExamContext)
  const examTitle = findChildElementByLocalName(root, 'exam-title')!
  const examStylesheet = root.getAttribute('exam-stylesheet')
  const externalMaterial = findChildElementByLocalName(root, 'external-material')

  initI18n(language, root.getAttribute('exam-code'), root.getAttribute('day-code'))
  const { t } = useTranslation()

  useEffect(scrollToHash, [])

  return (
    <main className="e-exam attachments">
      <React.StrictMode />
      {examStylesheet && <link rel="stylesheet" href={resolveAttachment(examStylesheet)} />}
      <Section aria-labelledby="title">
        {examTitle && (
          <DocumentTitle id="title">
            {renderChildNodes(examTitle)}
            {examTitle.textContent!.includes(',') ? '; ' : ', '}
            {t('attachments-page-title')}
          </DocumentTitle>
        )}
        <div className="e-semibold e-mrg-b-6">{dateTimeFormatter.format(date)}</div>
        {externalMaterial && (
          <AttachmentsExternalMaterial {...{ element: externalMaterial, renderChildNodes, forceRender: true }} />
        )}
      </Section>
      {renderChildNodes(root)}
    </main>
  )
}

export default React.memo(withExamContext(Attachments))
