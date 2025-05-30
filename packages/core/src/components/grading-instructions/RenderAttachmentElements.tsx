import React from 'react'
import { ExamComponentProps, RenderOptions } from '../../createRenderChildNodes'
import { queryAncestors } from '../../dom-utils'
import { gradingInstructionContent } from './gradingInstructionContent'

function RenderAttachmentElements({ element, renderChildNodes }: ExamComponentProps) {
  const renderOption =
    queryAncestors(element, gradingInstructionContent) != null ? RenderOptions.RenderHTML : RenderOptions.SkipHTML

  return <>{renderChildNodes(element, renderOption)}</>
}

export default React.memo(RenderAttachmentElements)
