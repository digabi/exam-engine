import React from 'react'
import { queryAncestors } from '../dom-utils'
import { withContext } from './withContext'
import { ExamComponentProps } from '../createRenderChildNodes'

export type AttachmentContext =
  | { name: string | null; isExternal: false; displayNumber: null }
  | { name: string | null; isExternal: true; displayNumber: string }

export const AttachmentContext = React.createContext<AttachmentContext>({} as AttachmentContext)

export const withAttachmentContext = withContext<AttachmentContext, ExamComponentProps>(
  AttachmentContext,
  ({ element }) => {
    const isExternal = queryAncestors(element, 'external-material') != null
    const name = element.getAttribute('name')
    return isExternal
      ? { displayNumber: element.getAttribute('display-number')!, isExternal, name }
      : { displayNumber: null, isExternal, name }
  }
)
