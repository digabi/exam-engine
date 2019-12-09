import React from 'react'
import { closest } from '../dom-utils'
import { ExamComponentProps } from './types'
import { withContext } from './withContext'

export type AttachmentContext =
  | { name: string | null; isExternal: false; displayNumber: null }
  | { name: string | null; isExternal: true; displayNumber: string }

export const AttachmentContext = React.createContext<AttachmentContext>({} as AttachmentContext)

export const withAttachmentContext = withContext<AttachmentContext, ExamComponentProps>(
  AttachmentContext,
  ({ element }) => {
    const isExternal = closest(element, 'external-material') != null
    const name = element.getAttribute('name')
    return isExternal
      ? { displayNumber: element.getAttribute('display-number')!, isExternal, name }
      : { displayNumber: null, isExternal, name }
  }
)
