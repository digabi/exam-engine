import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'

const NotificationIcon: React.FunctionComponent = () => (
  <FontAwesomeIcon size="lg" icon={solid('circle-info')} fixedWidth className="e-color-link e-mrg-r-1" />
)

export default NotificationIcon
