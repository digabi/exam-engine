import { ExamComponentProps } from '../createRenderChildNodes'
import React from 'react'
import { getDisplayName } from '../getDisplayName'

export const renderIf = (predicate: (props: ExamComponentProps) => boolean) => (
  Component: React.ComponentType<ExamComponentProps>
): React.FunctionComponent<ExamComponentProps> => {
  const Wrapped = (props: ExamComponentProps) => (predicate(props) ? <Component {...props} /> : null)
  Wrapped.displayName = 'RenderIf(' + getDisplayName(Component) + ')'
  return Wrapped
}
