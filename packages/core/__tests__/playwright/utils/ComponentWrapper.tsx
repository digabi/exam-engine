import React from 'react'
import { Provider } from 'react-redux'
import { I18nextProvider } from 'react-i18next'
import { initializeExamStore } from '../../../src/store'
import { parseExamStructure } from '../../../src/parser/parseExamStructure'
import { useCached } from '../../../src/useCached'
import { examServerApi } from '../../examServerApi'
import { initI18n } from '../../../src/i18n'
import { withCommonExamContext } from '../../../src/components/context/CommonExamContext'
import { withExamContext } from '../../../src/components/context/ExamContext'
import { CommonExamProps } from '../../../src/components/exam/Exam'
import '../../../src/css/main.less'

export interface ComponentWrapperProps extends CommonExamProps {
  doc: XMLDocument
  children: React.ReactElement
}

const WrappedComponent: React.FC<ComponentWrapperProps> = ({ doc, children }) => {
  const i18n = useCached(() => initI18n('fi-FI'))
  const store = useCached(() => initializeExamStore(parseExamStructure(doc), 'allowed', [], [], examServerApi))

  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <div className="e-exam">{children}</div>
      </I18nextProvider>
    </Provider>
  )
}

export const ComponentWrapper = withExamContext(withCommonExamContext(WrappedComponent))
