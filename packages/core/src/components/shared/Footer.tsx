import React from 'react'
import { VersionNumber } from './VersionNumber'

export const Footer: React.FC = () => (
  <footer className="e-footer">
    <div className="e-footer-version-number-container">
      <VersionNumber />
    </div>
  </footer>
)
