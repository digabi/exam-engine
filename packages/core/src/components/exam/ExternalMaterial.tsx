import React, { useContext } from 'react'
import { createRenderChildNodes, ExamComponentProps, RenderOptions } from '../../createRenderChildNodes'
import { queryAncestors } from '../../dom-utils'
import { useExamTranslation } from '../../i18n'
import { externalMaterialListTitleId } from '../../ids'
import { url } from '../../url'
import { AttachmentContext, withAttachmentContext } from '../context/AttachmentContext'
import { CommonExamContext } from '../context/CommonExamContext'

const renderChildNodes = createRenderChildNodes({
  attachment: withAttachmentContext(Attachment),
  'attachment-title': AttachmentTitle
})()

function Attachment({ element }: ExamComponentProps) {
  const { displayNumber } = useContext(AttachmentContext)

  return (
    <li data-list-number={displayNumber} aria-label={displayNumber!}>
      {renderChildNodes(element, RenderOptions.SkipHTML)}
    </li>
  )
}

function AttachmentTitle({ element }: ExamComponentProps) {
  const { attachmentsURL } = useContext(CommonExamContext)
  const { displayNumber } = useContext(AttachmentContext)

  return (
    <a href={url(attachmentsURL, { hash: displayNumber! })} className="exam-attachment-title" target="attachments">
      {renderChildNodes(element)}
    </a>
  )
}

interface ExternalMaterialProps extends ExamComponentProps {
  forceRender?: boolean // TODO: Figure out a better way to selectively not render some XML elements.
  showTitle?: boolean
}

function ExternalMaterial({ element, showTitle = true, forceRender = false }: ExternalMaterialProps) {
  if (queryAncestors(element, 'question') == null && !forceRender) {
    return null
  }

  const { t } = useExamTranslation()
  const id = externalMaterialListTitleId(element)

  return (
    <div className="external-material-list e-mrg-b-4">
      {showTitle && (
        <h3 className="external-material-title" id={id}>
          {t('external-material-title')}
        </h3>
      )}
      <ol className="e-list-data e-pad-l-0 e-mrg-0" aria-labelledby={id}>
        {renderChildNodes(element)}
      </ol>
    </div>
  )
}

export default React.memo(ExternalMaterial)
