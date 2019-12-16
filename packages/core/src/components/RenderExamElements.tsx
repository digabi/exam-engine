import React from 'react'
import { RenderOptions } from '../createRenderChildNodes'
import { ExamComponentProps } from './types'

function RenderExamElements({ element, renderChildNodes }: ExamComponentProps) {
  return <>{renderChildNodes(element, RenderOptions.SkipHTML)}</>
}

export default React.memo(RenderExamElements)
