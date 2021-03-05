import * as _ from 'lodash-es'
import { ExamTranslations } from './fi-FI'
import { sv_FI } from './sv-FI'

export const BA: ExamTranslations = _.pick(sv_FI, [
  'exam-total',
  'material',
  'external-material-title',
  'section',
  'references',
  'toc-heading',
])
