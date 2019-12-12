import i18n from 'i18next'
import * as _ from 'lodash-es'
import { A_E } from './A_E'
import { BA } from './BA'
import { CA } from './CA'
import { EA } from './EA'
import { FA } from './FA'
import { fi_FI } from './fi-FI'
import { GC } from './GC'
import { M } from './M'
import { O_E } from './O_E'
import { PA } from './PA'
import { SA } from './SA'
import { sv_FI } from './sv-FI'
import { TC } from './TC'
import { VA } from './VA'
import { Z } from './Z'

const examSpecificTranslations = {
  A_E,
  BA,
  BB: BA,
  CA,
  CB: CA,
  EA,
  EC: EA,
  DC: Z,
  FA,
  FC: FA,
  GC,
  M,
  N: M,
  O_E,
  SA,
  SC: SA,
  PA,
  PC: PA,
  TC,
  VA,
  VC: VA,
  Z
}

const resources = {
  'fi-FI': {
    translation: fi_FI,
    ...examSpecificTranslations
  },
  'sv-FI': {
    translation: sv_FI,
    ...examSpecificTranslations
  }
}

export function initI18n(language: string, examCode: string | null, dayCode: string | null) {
  const namespace = examCode ? examCode + (dayCode ? `_${dayCode}` : '') : 'translation'

  return i18n.createInstance(
    {
      resources,
      lng: language,
      fallbackLng: 'fi-FI',
      debug: false,
      defaultNS: namespace,
      fallbackNS: 'translation',
      interpolation: {
        escapeValue: false,
        format: (value, format) => {
          switch (format) {
            case 'range': {
              const [start, end] = value
              return start == null ? end : end == null ? start : start === end ? start : start + '–' + end
            }
            case 'first':
              return _.first(value)
            case 'last':
              return _.last(value)
            default:
              return value
          }
        }
      }
    },
    _.noop
  )
}

export default i18n
