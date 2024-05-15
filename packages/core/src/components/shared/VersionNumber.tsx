import React from 'react'
import * as _ from 'lodash-es'
import lernaConfig from '../../../../../lerna.json'

export const VersionNumber: React.FC = () => {
  const testVersion = _.get(window, 'TEST_VERSION_NUMBER')
  return <span>EE v.{testVersion || lernaConfig.version}</span>
}
