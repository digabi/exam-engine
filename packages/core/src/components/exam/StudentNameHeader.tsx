import React from 'react'

interface Props {
  studentName?: string
  allowLanguageChange?: boolean
}

export const StudentNameHeader = (props: Props) => <div className="e-student-name-container">{props.studentName}</div>
