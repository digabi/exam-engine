import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { createRenderChildNodes, RenderOptions } from '../createRenderChildNodes'
import { url } from '../url'
import { AttachmentContext, withAttachmentContext } from './AttachmentContext'
import { ExamContext } from './ExamContext'
import { ExamComponentProps } from './types'

const renderChildNodes = createRenderChildNodes({
  attachment: withAttachmentContext(Attachment),
  'attachment-title': AttachmentTitle
})

function Attachment({ element }: ExamComponentProps) {
  const { displayNumber } = useContext(AttachmentContext)

  return (
    <li data-list-number={displayNumber} aria-label={displayNumber!.replace(' ', '')}>
      {renderChildNodes(element, RenderOptions.SkipHTML)}
    </li>
  )
}

function AttachmentTitle({ element }: ExamComponentProps) {
  const { attachmentsURL } = useContext(ExamContext)
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
  if (element.closest('question') == null && !forceRender) {
    return null
  }

  const { t } = useTranslation()

  return (
    <div className="external-material-list e-mrg-b-4">
      {showTitle && <div className="e-font-size-l e-semibold">{t('material')}</div>}
      <ol className="e-list-data e-pad-l-0 e-mrg-0">{renderChildNodes(element)}</ol>
    </div>
  )
}

export default React.memo(ExternalMaterialList)
