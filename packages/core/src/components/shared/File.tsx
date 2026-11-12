import classNames from 'classnames'
import React, { useContext } from 'react'
import { CommonExamContext } from '../context/CommonExamContext'
import { ExamComponentProps } from '../../createRenderChildNodes'

function File({ element, className, renderChildNodes }: ExamComponentProps) {
  const src = element.getAttribute('src')!
  const hasDescription = element.hasChildNodes()
  const { resolveAttachment, onFileOpen } = useContext(CommonExamContext)
  const href = resolveAttachment(src)

  const onClick = (event: React.MouseEvent) => {
    if (!onFileOpen) {
      return
    }
    event.preventDefault()
    onFileOpen(href)
  }

  return (
    <a className={classNames('file e-nowrap', className)} href={href} onClick={onClick}>
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
