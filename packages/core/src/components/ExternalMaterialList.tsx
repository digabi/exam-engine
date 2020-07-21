import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { createRenderChildNodes, ExamComponentProps, RenderOptions } from '../createRenderChildNodes'
import { queryAncestors } from '../dom-utils'
import { url } from '../url'
import { AttachmentContext, withAttachmentContext } from './AttachmentContext'
import { CommonExamContext } from './CommonExamContext'

const renderChildNodes = createRenderChildNodes({
  attachment: withAttachmentContext(Attachment),
  'attachment-title': AttachmentTitle,
})

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

interface ExternalMaterialListProps extends ExamComponentProps {
  forceRender?: boolean // TODO: Figure out a better way to selectively not render some XML elements.
  showTitle?: boolean
}

function ExternalMaterialList({ element, showTitle = true, forceRender = false }: ExternalMaterialListProps) {
  if (queryAncestors(element, 'question') == null && !forceRender) {
    return null
  }

  const { t } = useTranslation()

  return (
    <div className="external-material-list e-mrg-b-4">
      {showTitle && <div className="e-font-size-l e-semibold">{t('external-material-title')}</div>}
      <ol className="e-list-data e-pad-l-0 e-mrg-0">{renderChildNodes(element)}</ol>
    </div>
  )
}

export default React.memo(ExternalMaterialList)
