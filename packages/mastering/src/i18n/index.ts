import i18n from 'i18next'
import _ from 'lodash'
import examFootersFi from './exam_footers_fi-FI.json'
import examFootersSv from './exam_footers_sv-FI.json'
import examTitlesFi from './exam_titles_fi-FI.json'
import examTitlesSv from './exam_titles_sv-FI.json'

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
      compatibilityJSON: 'v4',
      resources,
      lng,
      fallbackLng: 'fi-FI',
      debug: false
    },
    _.noop // Force i18next to initialize the instance.
  )
}
