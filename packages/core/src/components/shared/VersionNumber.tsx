import React from 'react'
import lernaConfig from '../../../../../lerna.json'

export const VersionNumber: React.FC = () => <span>EE v.{lernaConfig.version}</span>
