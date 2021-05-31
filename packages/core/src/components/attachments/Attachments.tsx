import React, { useContext, useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'
import { createRenderChildNodes } from '../../createRenderChildNodes'
import { findChildElement, NBSP } from '../../dom-utils'
import { changeLanguage, initI18n, useExamTranslation } from '../../i18n'
import { examTitleId } from '../../ids'
import { scrollToHash } from '../../scrollToHash'
import { useCached } from '../../useCached'
import AttachmentsExternalMaterial from './ExternalMaterial'
import AttachmentsQuestion from './Question'
import AttachmentsQuestionTitle from './QuestionTitle'
import { CommonExamContext, withCommonExamContext } from '../context/CommonExamContext'
import DocumentTitle from '../DocumentTitle'
import { ExamProps } from '../exam/Exam'
import { withExamContext } from '../context/ExamContext'
import RenderChildNodes from '../RenderChildNodes'
import RenderExamElements from '../RenderExamElements'
import SectionElement from '../SectionElement'
import { withSectionContext } from '../context/SectionContext'

const renderChildNodes = createRenderChildNodes({
  'audio-group': RenderExamElements,
  'external-material': AttachmentsExternalMaterial,
  'question-title': AttachmentsQuestionTitle,
  question: AttachmentsQuestion,
  section: withSectionContext(RenderChildNodes),
})

const Attachments: React.FunctionComponent<ExamProps> = () => {
  const { root, language, date, dateTimeFormatter, resolveAttachment, subjectLanguage } = useContext(CommonExamContext)

  const examTitle = findChildElement(root, 'exam-title')!
  const examStylesheet = root.getAttribute('exam-stylesheet')
  const externalMaterial = findChildElement(root, 'external-material')

  const examCode = root.getAttribute('exam-code')
  const dayCode = root.getAttribute('day-code')
  const i18n = useCached(() => initI18n(language, examCode, dayCode))
  useEffect(changeLanguage(i18n, language))

  useEffect(scrollToHash, [])

  return (
    <I18nextProvider i18n={i18n}>
      <main className="e-exam attachments" lang={subjectLanguage} aria-labelledby={examTitleId}>
        <React.StrictMode />
        {examStylesheet && <link rel="stylesheet" href={resolveAttachment(examStylesheet)} />}
        <SectionElement aria-labelledby={examTitleId}>
          {examTitle && (
            <DocumentTitle id={examTitleId}>
              <AttachmentsPageTitle />
              {NBSP}
              {renderChildNodes(examTitle)}
            </DocumentTitle>
          )}
          <div className="e-semibold e-mrg-b-6">{dateTimeFormatter.format(date)}</div>
          {externalMaterial && (
            <AttachmentsExternalMaterial {...{ element: externalMaterial, renderChildNodes, forceRender: true }} />
          )}
        </SectionElement>
        {renderChildNodes(root)}
      </main>
    </I18nextProvider>
  )
}

// Wrap to a separate component, since we can't use translation hooks in the root component.
export const AttachmentsPageTitle: React.FunctionComponent = () => {
  const { t } = useExamTranslation()
  return <>{t('attachments-page-title')}</>
}

export default React.memo(withExamContext(withCommonExamContext(Attachments)))
