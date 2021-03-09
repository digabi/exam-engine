import i18n, { PostProcessorModule, TFunctionKeys, TOptions } from 'i18next'
import * as _ from 'lodash-es'
import React from 'react'
// eslint-disable-next-line no-restricted-imports
import { TFuncKey, TFunction, useTranslation } from 'react-i18next'
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

declare module 'react-i18next' {
  type ExamEngineI18nResources = { translation: typeof fi_FI }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Resources extends ExamEngineI18nResources {}
}

export function initI18n(language: string, examCode: string | null, dayCode: string | null): typeof i18n {
  const namespace = examCode ? examCode + (dayCode ? `_${dayCode}` : '') : 'translation'

  return i18n
    .use<PostProcessorModule>({
      type: 'postProcessor',
      name: 'lowercase',
      process: (value, _key, options) => value.toLocaleLowerCase(options.lng),
    })
    .createInstance(
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
                const [start, end] = value as [string, string]
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

export function useExamTranslation() {
  const { i18n, t: originalT } = useTranslation()
  type Translator = {
    <TKeys extends TFuncKey>(key: TKeys | TKeys[], options?: TOptions): string | JSX.Element
    raw: TFunction
  }
  const t: Translator = (key, options) => translate(i18n, key, options)
  t.raw = originalT
  return { i18n, t }
}

/**
 * Custom wrapper for i18n.t that wraps the translated text in a span element
 * containing the correct lang attribute, if necessary.
 *
 * If you want to disable the wrapping, you can use `t.raw(…)`.
 */
function translate<TKeys extends TFunctionKeys>(
  instance: typeof i18n,
  key: TKeys | TKeys[],
  options?: TOptions
): string | JSX.Element {
  const translation = instance.t(key, options)

  const namespace = instance.options.defaultNS!
  const examHasCustomTranslations = namespace !== 'translation' && namespace in examSpecificTranslations
  const hasCustomTranslationForKey = examHasCustomTranslations && hasTranslation(instance, namespace, key)
  return hasCustomTranslationForKey || !examHasCustomTranslations ? (
    translation
  ) : (
    <span lang={instance.language}>{translation}</span>
  )
}

/**
 * A hacky way to check if we have a translation in the specified namespace.
 * Ideally, we'd probably want to use `i18n.exists()` for this purpose, but I
 * couldn't find a way to disable the fallback mechanism when using it.
 */
function hasTranslation<TKeys extends TFunctionKeys>(
  instance: typeof i18n,
  namespace: string,
  key: TKeys | TKeys[]
): boolean {
  return Array.isArray(key)
    ? key.some((k) => instance.getResource(instance.language, namespace, k as string) != null)
    : instance.getResource(instance.language, namespace, key as string) != null
}

export default i18n
