import React, { useLayoutEffect, useRef } from 'react'

type DocumentTitleProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>

/** A helper component that sets document.title based on its contents. */
const DocumentTitle: React.FunctionComponent<DocumentTitleProps> = props => {
  const ref = useRef<HTMLHeadingElement>(null)
  useLayoutEffect(() => {
    if (ref.current) {
      document.title = ref.current.textContent!
    }
  })
  return <h1 {...props} ref={ref} />
}

export default React.memo(DocumentTitle)
