import React from 'react'
import { ExamComponentProps } from '../createRenderChildNodes'

function RenderChildNodes({ element, renderChildNodes }: ExamComponentProps) {
  return <>{renderChildNodes(element)}</>
}

export default React.memo(RenderChildNodes)
