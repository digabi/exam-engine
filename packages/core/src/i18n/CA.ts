import * as _ from 'lodash-es'
import { ExamTranslations, fi_FI } from './fi-FI'

export const CA: ExamTranslations = _.pick(fi_FI, [
  'exam-total',
  'material',
  'external-material-title',
  'section',
  'references',
  'toc-heading',
])
