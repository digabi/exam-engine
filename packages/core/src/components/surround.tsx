import React from 'react'
import { getDisplayName } from '../getDisplayName'
import { ExamComponentProps } from '../createRenderChildNodes'

/** Surrounds an Exam component with a static HTML element.
 *
 * @example surround(Question, 'div', {className: 'foobar'})
 */
export default function surround<K extends keyof JSX.IntrinsicElements>(
  Component: React.ComponentType<ExamComponentProps>,
  Tag: K,
  props?: JSX.IntrinsicElements[K]
): React.ComponentType<ExamComponentProps> {
  const Wrapped = (componentProps: ExamComponentProps) => {
    // Can't seem to be able to limit the type to HTML elements that accept children.
    // So as a hack, type them as any inside the function to make the compiler happy.
    const TagAsAny = Tag as any
    return (
      <TagAsAny {...props}>
        <Component {...componentProps} />
      </TagAsAny>
    )
  }
  Wrapped.displayName = 'Surround(' + getDisplayName(Component) + ')'
  return Wrapped
}
