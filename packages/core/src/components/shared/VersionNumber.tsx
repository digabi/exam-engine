import React from 'react'
import * as _ from 'lodash-es'
import packageConfig from '../../../package.json'

export const VersionNumber: React.FC = () => {
  const testVersion = _.get(window, 'TEST_VERSION_NUMBER')
  return <span>EE v.{testVersion || packageConfig.version}</span>
}
