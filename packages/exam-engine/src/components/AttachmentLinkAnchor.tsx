import React from 'react'

const AttachmentLinkAnchor = ({ children, href }: { children: React.ReactNode; href: string }) => (
  <a href={href} className="attachment-link e-nowrap" target="attachments">
    {children}
  </a>
)

export default AttachmentLinkAnchor
