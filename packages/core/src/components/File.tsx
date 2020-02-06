import classNames from 'classnames'
import React, { useContext } from 'react'
import { CommonExamContext } from './CommonExamContext'
import { ExamComponentProps } from './types'

function File({ element, className, renderChildNodes }: ExamComponentProps) {
  const src = element.getAttribute('src')!
  const hasDescription = element.hasChildNodes()
  const { resolveAttachment } = useContext(CommonExamContext)

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
