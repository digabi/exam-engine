import * as _ from 'lodash-es'
import { examTitlesFi } from './exam_titles_fi-FI'
import { examTitlesSv } from './exam_titles_sv-FI'

export function getExamCodes() {
  return _.uniq(Object.keys(examTitlesFi.codes).concat(Object.keys(examTitlesSv.codes)))
}

export function getExamTitle(
  query:
    | {
        examCode: keyof typeof examTitlesFi.codes
        lang: 'fi-FI'
      }
    | {
        examCode: keyof typeof examTitlesSv.codes
        lang: 'sv-FI'
      }
): string {
  return query.lang === 'fi-FI' ? examTitlesFi.codes[query.examCode] : examTitlesSv.codes[query.examCode]
}
