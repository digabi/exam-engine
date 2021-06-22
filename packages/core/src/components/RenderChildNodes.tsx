import React from 'react'
import { ExamComponentProps } from '../createRenderChildNodes'

function RenderChildNodes({ element, renderChildNodes }: ExamComponentProps) {
  const children = renderChildNodes(element)
  return children.length === 0 ? null : <>{children}</>
}

export default RenderChildNodes
