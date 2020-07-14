import { faInfoCircle } from '@fortawesome/free-solid-svg-icons/faInfoCircle'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

const NotificationIcon: React.FunctionComponent = () => (
  <FontAwesomeIcon size="lg" icon={faInfoCircle} fixedWidth className="e-color-link e-mrg-r-1" />
)

export default NotificationIcon
