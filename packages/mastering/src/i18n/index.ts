import i18n from 'i18next'
import _ from 'lodash'
import examFootersFi from './exam_footers_fi-FI.json'
import examFootersSv from './exam_footers_sv-FI.json'
import { examTitlesFi, examTitlesSv } from '@digabi/exam-engine-core'

const resources = {
  'fi-FI': {
    'exam-title': examTitlesFi,
    'exam-footer': examFootersFi
  },
  'sv-FI': {
    'exam-title': examTitlesSv,
    'exam-footer': examFootersSv
  }
}

export function initI18n(lng: string): typeof i18n {
  return i18n.createInstance(
    {
      compatibilityJSON: 'v3',
      resources,
      lng,
      fallbackLng: 'fi-FI',
      debug: false
    },
    _.noop // Force i18next to initialize the instance.
  )
}
