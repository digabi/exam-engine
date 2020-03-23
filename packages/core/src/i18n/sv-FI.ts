import { Translations } from './fi-FI'

// tslint:disable-next-line:variable-name
export const sv_FI: Translations = {
  'exam-total': 'Provet sammanlagt',
  'grading-total': 'Sammanlagt',
  material: 'Material',
  material_plural: 'Material',
  'attachments-page-title': 'material',
  'external-material-title': 'Material',
  part: 'Del {{displayNumber}}:',
  question: '{{displayNumber}}',
  grade: 'Vitsord',
  comment: 'Kommentar',
  points: '{{count}} p.',
  points_plural: '{{count}} p.',
  'points-screen-reader': '{{count}} poäng',
  'points-screen-reader_plural': '{{count}} poäng',
  'audio-errors': {
    'already-accessed': 'Du har redan spelat denna inspelning. Uppdatera sidan',
    'already-playing': 'Lyssna först inspelningen till slut.',
    'other-error': 'Uppspelning misslyckades, be övervakaren om hjälp.'
  },
  'audio-test': {
    instructions: 'Provet omfattar uppgifter i hörförståelse.',
    play: 'Testa hörbarheten',
    volume: 'Du kan justera ljudvolymen uppe i högra hörnet av rutan.'
  },
  grading: {
    'pregrading-annotations': 'Preliminära bedömningens anteckningar',
    'censor-annotations': 'Censorns anteckningar'
  },
  references: {
    heading: 'Källor',
    source: 'Källa:',
    date: 'Publicerad:',
    'reference-date': 'Hämtad:',
    translator: 'Översättning:',
    'modified-by': 'Bearbetning:'
  },
  cas: {
    forbidden: {
      infoText: 'Du får tillgång till de blockerade räknarprogrammen efter att du returnerat del A.',
      buttonText: 'Returnera del A'
    },
    allowing: {
      infoText: 'Svaren i A-delen låses. Du får tillgång till de blockerade räknarprogrammen om en stund.',
      buttonText: 'Avbryt ({{count}}s)'
    },
    allowed: {
      infoText: 'Del A returnerad'
    }
  },
  'toc-heading': 'Innehåll',
  'answer-saved': 'Sparad',
  'listen-times-remaining': '{{count}} lyssningsgång kvar.',
  'listen-times-remaining_plural': '{{count}} lyssningsgånger kvar.',
  'answer-length_plural': 'Svarets längd: {{count}} tecken.',
  'answer-length': 'Svarets längd: {{count}} tecken.',
  'previous-answer-versions': 'Tidigare utkast till svar',
  'zoom-in': 'Förstora',
  /**
   * These keys have the following pattern: `{question|section|toc-fi}_{childQuestionCount}_{minAnswers}_${maxAnswers}`
   * The `*` character serves as a wildcard.
   */
  'answering-instructions': {
    'question_*_1_1': 'Besvara en av punkterna {{questions, range}}.',
    'question_*_2_2': 'Besvara två av punkterna {{questions, range}}.',
    'question_*_3_3': 'Besvara tre av punkterna {{questions, range}}.',
    'question_*_4_4': 'Besvara fyra av punkterna {{questions, range}}.',
    'question_*_5_5': 'Besvara fem av punkterna {{questions, range}}.',
    'question_*_6_6': 'Besvara sex av punkterna {{questions, range}}.',
    'question_*_7_7': 'Besvara sju av punkterna {{questions, range}}.',
    'question_*_8_8': 'Besvara åtta av punkterna {{questions, range}}.',
    'question_*_9_9': 'Besvara nio av punkterna {{questions, range}}.',
    'question_*_10_10': 'Besvara tio av punkterna {{questions, range}}.',
    'question_2_*_1': 'Besvara antingen punkt {{questions, first}} eller {{questions, last}}.',
    'question_*_*_*': 'Besvara {{answerCount, range}} av punkterna {{questions, range}}.',
    'section_*_1_1': 'Besvara en uppgift.',
    'section_*_2_2': 'Besvara två uppgifter.',
    'section_*_3_3': 'Besvara tre uppgifter.',
    'section_*_4_4': 'Besvara fyra uppgifter.',
    'section_*_5_5': 'Besvara fem uppgifter.',
    'section_*_6_6': 'Besvara sex uppgifter.',
    'section_*_7_7': 'Besvara sju uppgifter.',
    'section_*_8_8': 'Besvara åtta uppgifter.',
    'section_*_9_9': 'Besvara nio uppgifter.',
    'section_*_10_10': 'Besvara tio uppgifter.',
    'section_1_*_1': 'Besvara uppgift {{questions, range}}.',
    'section_2_*_1': 'Besvara antingen uppgift {{questions, first}} eller {{questions, last}}.',
    'section_*_*_*': 'Besvara {{answerCount, range}} uppgifter.',
    'toc-section_*_1_1': 'Besvara en uppgift.',
    'toc-section_*_2_2': 'Besvara två uppgifter.',
    'toc-section_*_3_3': 'Besvara tre uppgifter.',
    'toc-section_*_4_4': 'Besvara fyra uppgifter.',
    'toc-section_*_5_5': 'Besvara fem uppgifter.',
    'toc-section_*_6_6': 'Besvara sex uppgifter.',
    'toc-section_*_7_7': 'Besvara sju uppgifter.',
    'toc-section_*_8_8': 'Besvara åtta uppgifter.',
    'toc-section_*_9_9': 'Besvara nio uppgifter.',
    'toc-section_*_10_10': 'Besvara tio uppgifter.',
    'toc-section_1_*_1': 'Besvara uppgift {{questions, range}}.',
    'toc-section_2_*_1': 'Besvara antingen uppgift {{questions, first}} eller {{questions, last}}.',
    'toc-section_*_*_*': 'Besvara {{answerCount, range}} uppgifter.'
  },
  'answer-errors': {
    'screenshot-limit-exceeded': 'Max {{limit}} bilder kan bifogas till svaret.',
    'screenshot-too-big':
      'Den skärmdump du tagit är för stor. Ta en ny skärmdump av en mindre del av skärmen och försök på nytt.',
    'screenshot-byte-limit-reached':
      'Minnesutrymmet för skärmdumpar är fullt. (Du kan referera till bilder i materialet direkt utan skärmdumpar.)',
    'screenshot-upload-failed': 'Bifogandet av skärmdumpen misslyckades. Försök på nytt.'
  }
}
