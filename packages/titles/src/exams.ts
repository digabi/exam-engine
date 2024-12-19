import * as _ from 'lodash'
import examTitlesFi from './exam_titles_fi-FI.json'
import examTitlesSv from './exam_titles_sv-FI.json'

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
