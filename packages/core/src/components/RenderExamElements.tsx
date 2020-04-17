import React from 'react'
import { ExamComponentProps, RenderOptions } from '../createRenderChildNodes'

function RenderExamElements({ element, renderChildNodes }: ExamComponentProps) {
  return <>{renderChildNodes(element, RenderOptions.SkipHTML)}</>
}

export default React.memo(RenderExamElements)
