import React from 'react'

const AttachmentLinkAnchor: React.FunctionComponent<{ href: string }> = ({ children, href }) => (
  <a href={href} className="attachment-link e-nowrap" target="attachments">
    {children}
  </a>
)

export default AttachmentLinkAnchor
