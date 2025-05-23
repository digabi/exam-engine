import { Translations } from './fi-FI'

export const sv_FI: Translations = {
  'exam-total': 'Provet sammanlagt',
  'grading-total': 'Sammanlagt',
  material: 'Material',
  'attachments-page-title': 'Material:',
  'external-material-title': 'Material',
  'grading-instructions-page-title': 'Beskrivningar av goda svar:',
  section: 'Del {{displayNumber}}:',
  question: 'Uppgift {{displayNumber}}:',
  grade: 'Vitsord',
  comment: 'Kommentar',
  points: '{{count}} p.',
  recording: 'Inspelningen',
  'audio-errors': {
    'already-accessed': 'Du har redan spelat denna inspelning. Uppdatera sidan',
    'already-playing': 'Lyssna först inspelningen till slut.',
    'permission-denied': 'Ge mikrofonen nödvändiga användarrättigheter. Be övervakaren om hjälp vid behov."',
    'other-recording-error': 'Ett fel uppstod. Uppdatera sidan.',
    'other-error': 'Uppspelning misslyckades, be övervakaren om hjälp.'
  },
  'audio-test': {
    instructions: 'Provet omfattar uppgifter i hörförståelse.',
    play: 'Testa hörbarheten',
    volume: 'Du kan justera ljudvolymen uppe i högra hörnet av rutan.'
  },
  'dropdown-answer': {
    label: 'Välj det alternativ som passar bäst.',
    clear: 'Avmarkera alternativet.'
  },
  grading: {
    'pregrading-annotations': 'Preliminära bedömningens anteckningar (lärare)',
    'censor-annotations': 'Censorns anteckningar',
    'pregrading-abbrev': 'prel.',
    'inspection-grading-abbrev': 'ompr.',
    'round.1': '1.c',
    'round.2': '2.c',
    'round.3': '3.c',
    annotate: 'Markera',
    'non-answer-not-graded': 'Lämnats utan bedömning',
    'loading-images': 'Vänta, bilder laddas...',
    'some-images-failed': 'Laddning av vissa bilder misslyckades. Var god uppdatera sidan.'
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
    examineSectionA: 'Du kan nu granska dina svar för del A.',
    cannotEditLater: 'När du har returnerat del A kan du inte längre redigera svaren för del A.',
    youCanReturn:
      'Efter att du granskat dina svar kan du gå tillbaka till provet för att fortsätta svara på uppgifterna.',
    forbidden: {
      infoText: 'Du får tillgång till de blockerade räknarprogrammen efter att du returnerat del A.',
      buttonText: 'Returnera del A'
    },
    allowing: {
      infoText: 'Svaren i A-delen låses. Du får tillgång till de blockerade räknarprogrammen om en stund.',
      cancel: 'Avbryt ({{count}} s)'
    },
    allowed: {
      infoText: 'Del A returnerad'
    }
  },
  'examine-exam': {
    examine: 'Kontrollera dina svar',
    instructions: 'Efter att du granskat dina svar kan du ännu gå tillbaka och redigera svaren eller avsluta provet.'
  },
  'dnd-answers': {
    'all-answer-options': 'Svarsalternativ:',
    'correct-answers': 'Rätta svar',
    'question-missing': 'Här fattas en item...',
    'answer-missing': 'Här fattas svaret...',
    'drop-here': 'Släpp här',
    'no-answer': '(Inget svar)'
  },
  undo: {
    loading: 'Laddar...',
    close: 'Stäng',
    restoreAnswer: 'Återställ',
    answerNoText: 'ingen text',
    answerWordCount: '{{count}} ord',
    answerWordCount_plural: '{{count}} ord',
    answerCharacterCount: '{{count}} tecken',
    answerCharacterCount_plural: '{{count}} tecken',
    answerImageCount: '{{count}} bild',
    answerImageCount_plural: '{{count}} bilder',
    minutesSinceAnswer: '{{ minutes }} min sedan',
    latestVersion: 'Den senaste versionen'
  },
  examineExam: {
    returnToExam: 'Återvänd till provutförandet',
    checkYourAnswersTitle: 'Kontrollera dina svar',
    hereAreYourAnswers: 'Du ser här dina svar på samma sätt som de som bedömer proven kommer att se dem.',
    checkYourAnswers: 'Kontrollera att du kan se alla de svar som du vill lämna in till bedömning.',
    removeExcessAnswers:
      'Om du ser svar som du inte vill lämna in till bedömning bör du gå tillbaka till provet och avlägsna dem.',
    emptyAnswersAreHighlighted: 'Tomma svarsfält har markerats.',
    thereMayBeOptionalQuestions:
      'Det kan finnas valbara uppgifter i provet, och därmed innebär ett tomt svarsfält inte alltid att något är fel.',
    questionHasNoAnswer: 'Denna fråga har inte besvarats',
    endExamTitle: 'Avsluta provet',
    afterInspectingYourAnswers:
      'När du har kontrollerat dina svar kan du avsluta provet genom att klicka på knappen nedan.',
    youCanNotReturnToExam: 'Efter att du klickat på knappen kan du inte längre gå tillbaka till provet.',
    thankYouTitle: 'Tack!',
    shutdownComputer: 'Stäng nu av datorn.',
    returnUsbStick: 'När datorn har är avstängd, ta bort USB-minnet och ge det till provets övervakare.'
  },
  'toc-heading': 'Innehåll',
  'no-attachments': 'Detta prov innehåller inget material.',
  'answer-saved': 'Sparad',
  'too-many-answers': 'Svar på för många uppgifter:',
  'max-answers-warning': 'Besvara högst {{count}} uppgift.',
  'max-answers-warning_plural': 'Besvara högst {{count}} uppgifter.',
  'open-writing-mode': 'Öppna skrivvyn',
  'close-writing-mode': 'Minska vyn',
  'listen-times-remaining': '{{count}} lyssningsgång kvar.',
  'listen-times-remaining_plural': '{{count}} lyssningsgånger kvar.',
  'answer-length': 'Svarets längd: {{count}} tecken.',
  'answer-length-with-max-length': 'Svarets längd: {{count}} / {{maxLength}} tecken.',
  'max-length-surplus': 'Svaret överskrider maximallängden på {{maxLength}} märken med {{percentage}} %.',
  'max-length-info':
    'Svaret får inte överskrida {{count}} tecken. Om det givna antalet tecken överskrids leder det till poängavdrag.',
  'previous-answer-versions': 'Tidigare utkast till svar',
  'zoom-in': 'Förstora bilden',
  'end-of-exam': 'Uppgifterna i provet slutar här.',
  'start.recording': 'Spela in svaret',
  'stop.recording': 'Stoppa inspelningen',
  'remove.recording': 'Radera din inspelning',
  /**
   * These keys have the following pattern: `{question|section|toc-fi}_{childQuestionCount}_{minAnswers}_${maxAnswers}`
   * The `*` character serves as a wildcard.
   */
  'answering-instructions': {
    'exam_*_1_1': 'Besvara högst en uppgift i provet.',
    'exam_*_2_2': 'Besvara högst två uppgifter i provet.',
    'exam_*_3_3': 'Besvara högst tre uppgifter i provet.',
    'exam_*_4_4': 'Besvara högst fyra uppgifter i provet.',
    'exam_*_5_5': 'Besvara högst fem uppgifter i provet.',
    'exam_*_6_6': 'Besvara högst sex uppgifter i provet.',
    'exam_*_7_7': 'Besvara högst sju uppgifter i provet.',
    'exam_*_8_8': 'Besvara högst åtta uppgifter i provet.',
    'exam_*_9_9': 'Besvara högst nio uppgifter i provet.',
    'exam_*_10_10': 'Besvara högst tio uppgifter i provet.',
    'exam_*_*_*': 'Besvara högst {{answerCount, range}} uppgifter i provet.',
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
    'screenshot-too-big':
      'Den skärmdump du tagit är för stor. Ta en ny skärmdump av en mindre del av skärmen och försök på nytt.',
    'screenshot-byte-limit-reached':
      'Minnesutrymmet för skärmdumpar är fullt. (Du kan referera till bilder i materialet direkt utan skärmdumpar.)',
    'screenshot-upload-failed': 'Bifogandet av skärmdumpen misslyckades. Försök på nytt.',
    'answer-too-long': 'Svaret är för långt.'
  },
  'screen-reader': {
    'answer-begin': '[Svaret börjar]',
    'answer-end': '[Svaret avslutar]',
    'correct-answer': '[Accepterat svar]'
  }
}
