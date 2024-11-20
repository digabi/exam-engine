import React from 'react'
import { Provider } from 'react-redux'
import { I18nextProvider } from 'react-i18next'
import { initializeExamStore } from '../../../src/store'
import { parseExamStructure } from '../../../src/parser/parseExamStructure'
import { useCached } from '../../../src/useCached'
import { examServerApi } from '../../examServerApi'
import { initI18n } from '../../../src/i18n'
import '../../../src/css/main.less'

interface ComponentWrapperProps {
  exam: string
  children: React.ReactElement
}

export const ComponentWrapper: React.FC<ComponentWrapperProps> = ({ exam, children }) => {
  const parser = new DOMParser()
  const examXml = parser.parseFromString(exam, 'application/xml')
  const i18n = useCached(() => initI18n('fi-FI'))
  const store = useCached(() => initializeExamStore(parseExamStructure(examXml), 'allowed', [], [], examServerApi))
  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <div className="e-exam">{children}</div>
      </I18nextProvider>
    </Provider>
  )
}
