import React from 'react'

const AttachmentLinkAnchor: React.FunctionComponent<{ href: string; type: 'link' | 'plain' }> = ({
  children,
  href,
  type,
}) =>
  type === 'link' ? (
    <a href={href} className="attachment-link e-nowrap" target="attachments">
      {children}
    </a>
  ) : (
    <span className="attachment-link e-nowrap">{children}</span>
  )

export default AttachmentLinkAnchor
