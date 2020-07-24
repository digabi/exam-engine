import i18n from 'i18next'
import * as _ from 'lodash-es'
import { A_E } from './A_E'
import { BA } from './BA'
import { CA } from './CA'
import { EA } from './EA'
import { FA } from './FA'
import { fi_FI } from './fi-FI'
import { GC } from './GC'
import { I } from './I'
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
  FA,
  FC: FA,
  GC,
  I,
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
  Z,
}

const resources = {
  'fi-FI': {
    translation: fi_FI,
    ...examSpecificTranslations,
  },
  'sv-FI': {
    translation: sv_FI,
    ...examSpecificTranslations,
  },
}

export function initI18n(language: string, examCode: string | null, dayCode: string | null): typeof i18n {
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
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              const [start, end] = value
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/restrict-template-expressions
              return start == null ? end : end == null ? start : start === end ? start : `${start}–${end}`
            }
            case 'first':
              return _.first(value)
            case 'last':
              return _.last(value)
            default:
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              return value
          }
        },
      },
    },
    _.noop
  )
}

export const changeLanguage = (_i18n: typeof i18n, language: string) => (): void => {
  if (_i18n.language !== language) {
    _i18n.changeLanguage(language).then(_.noop).catch(_.noop)
  }
}

export default i18n
