import React from 'react'
import { ExamComponentProps } from './types'

function RenderChildNodes({ element, renderChildNodes }: ExamComponentProps) {
  return <>{renderChildNodes(element)}</>
}

export default React.memo(RenderChildNodes)
