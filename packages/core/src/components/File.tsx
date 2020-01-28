import classNames from 'classnames'
import React, { useContext } from 'react'
import { ExamAttachmentsContext } from './ExamAttachmentsContext'
import { ExamComponentProps } from './types'

function File({ element, className, renderChildNodes }: ExamComponentProps) {
  const src = element.getAttribute('src')!
  const hasDescription = element.hasChildNodes()
  const { resolveAttachment } = useContext(ExamAttachmentsContext)

  return (
    <a className={classNames('file e-nowrap', className)} href={resolveAttachment(src)} download>
      {hasDescription ? (
        <>
          {renderChildNodes(element)} ({src})
        </>
      ) : (
        src
      )}
    </a>
  )
}

export default React.memo(File)
