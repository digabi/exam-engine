import { DeepPartial } from 'utility-types'

/** A helper type for type-safe i18next translations. */
type ExtractTranslations<T> = {
  [K in keyof T as K extends `${string}_plural` ? never : K]: ExtractTranslations<T[K]>
} & {
  [K in keyof T as K extends `${string}_plural` ? never : T[K] extends string ? `${K & string}_plural` : never]?: T[K]
}

export type Translations = ExtractTranslations<typeof fi_FI>
export type ExamTranslations = DeepPartial<Translations>

export const fi_FI = {
  'exam-total': 'Koe yhteensä',
  'grading-total': 'Yhteensä',
  material: 'Aineisto',
  material_plural: 'Aineistot',
  'attachments-page-title': 'Aineisto:',
  'external-material-title': 'Aineisto',
  'grading-instructions-page-title': 'Hyvän vastauksen piirteet:',
  section: 'Osa {{displayNumber}}:',
  question: 'Tehtävä {{displayNumber}}:',
  grade: 'Arvosana',
  comment: 'Kommentti',
  points: '{{count}} p.',
  recording: 'Tallenne',
  'audio-errors': {
    'already-accessed': 'Olet jo toistanut tämän äänitteen. Päivitä sivu.',
    'already-playing': 'Kuuntele äänite ensin loppuun.',
    'other-error': 'Äänitteen toistaminen epäonnistui, pyydä apua valvojalta.'
  },
  'audio-test': {
    instructions: 'Koe sisältää kuullunymmärtämisen tehtäviä.',
    play: 'Testaa äänitteiden kuuluvuus',
    volume: 'Äänen voimakkuutta voit säätää ruudun oikeasta yläkulmasta.'
  },
  'dropdown-answer': {
    label: 'Valitse parhaiten sopiva vaihtoehto.',
    clear: 'Poista valinta.'
  },
  grading: {
    'pregrading-annotations': 'Alustavan arvostelun merkinnät (opettaja)',
    'censor-annotations': 'Sensorin merkinnät',
    'pregrading-abbrev': 'alust.',
    'inspection-grading-abbrev': 'ov',
    'round.1': '1.s',
    'round.2': '2.s',
    'round.3': '3.s',
    annotate: 'Merkitse',
    'non-answer-not-graded': 'Jätetty arvostelematta',
    'loading-images': 'Odota, kuvia ladataan...',
    'some-images-failed': 'Joidenkin kuvien lataaminen epäonnistui. Päivitä sivu.'
  },
  references: {
    heading: 'Lähteet',
    source: 'Lähde:',
    date: 'Julkaistu:',
    'reference-date': 'Viitattu:',
    translator: 'Käännös:',
    'modified-by': 'Muokkaus:'
  },
  cas: {
    examineSectionA: 'Voit käydä tarkastelemassa A-osan vastauksiasi nyt.',
    cannotEditLater: 'Palautettuasi A-osan et voi enää muokata A-osan vastauksia.',
    youCanReturn: 'Tarkastelun jälkeen voit palata kokeeseen jatkamaan tehtäviin vastaamista.',
    forbidden: {
      infoText: 'Saat estetyt laskinohjelmat käyttöösi palautettuasi A-osan.',
      buttonText: 'Palauta A-osa'
    },
    allowing: {
      infoText: 'A-osan vastaukset lukitaan. Saat estetyt laskinohjelmat käyttöösi hetken kuluttua.',
      cancel: 'Peruuta ({{count}} s)'
    },
    allowed: {
      infoText: 'A-osa palautettu'
    }
  },
  'examine-exam': {
    examine: 'Siirry tarkastelemaan vastauksiasi',
    instructions: 'Tarkastelun jälkeen voit vielä palata muokkaamaan vastauksia, tai päättää kokeen.'
  },
  'dnd-answers': {
    'all-answer-options': 'Vastausvaihtoehdot:',
    'correct-answers': 'Oikeat vastaukset',
    'question-missing': 'Tästä puuttuu osio...',
    'answer-missing': 'Tästä puuttuu vastaus...',
    'drop-here': 'Pudota tänne',
    'no-answer': '(Ei vastausta)'
  },
  undo: {
    loading: 'Ladataan...',
    close: 'Sulje',
    restoreAnswer: 'Palauta',
    answerNoText: 'ei tekstiä',
    answerWordCount: '{{count}} sana',
    answerWordCount_plural: '{{count}} sanaa',
    answerCharacterCount: '{{count}} merkki',
    answerCharacterCount_plural: '{{count}} merkkiä',
    answerImageCount: '{{count}} kuva',
    answerImageCount_plural: '{{count}} kuvaa',
    minutesSinceAnswer: '{{ minutes }} min sitten',
    latestVersion: 'Viimeisin versio'
  },
  examineExam: {
    returnToExam: 'Palaa suorittamaan koetta',
    checkYourAnswersTitle: 'Tarkista vastauksesi',
    hereAreYourAnswers: 'Näet tässä vastauksesi samanlaisina kuin kokeen arvostelijat tulevat ne näkemään.',
    checkYourAnswers: 'Tarkista, että näet alla kaikki vastaukset, jotka haluat jättää arvosteltavaksi.',
    removeExcessAnswers: 'Jos näet vastauksia, joita et halua jättää arvosteltavaksi, palaa kokeeseen ja poista ne.',
    emptyAnswersAreHighlighted: 'Tyhjät vastaukset on korostettu.',
    thereMayBeOptionalQuestions:
      'Kokeessa voi olla valinnaisia tehtäviä, joten tyhjä vastaus ei välttämättä tarkoita virhettä.',
    questionHasNoAnswer: 'Tähän kysymykseen ei ole vastattu',
    endExamTitle: 'Päätä koe',
    afterInspectingYourAnswers: 'Kun olet tarkistanut vastauksesi, päätä koe klikkaamalla alla olevaa nappia.',
    youCanNotReturnToExam: 'Napin klikkaamisen jälkeen et voi enää palata kokeeseen.',
    thankYouTitle: 'Kiitos!',
    shutdownComputer: 'Sammuta vielä tietokoneesi.',
    returnUsbStick: 'Kun kone on sammunut, irrota USB-muisti ja palauta se kokeen valvojalle.'
  },
  'toc-heading': 'Sisällys',
  'answer-saved': 'Tallennettu',
  'too-many-answers': 'Vastattu liian moneen tehtävään:',
  'max-answers-warning': 'Vastaa enintään {{count}} tehtävään.',
  'open-writing-mode': 'Avaa kirjoitusnäkymä',
  'close-writing-mode': 'Pienennä näkymä',
  'listen-times-remaining': '{{count}} kuuntelukerta jäljellä.',
  'listen-times-remaining_plural': '{{count}} kuuntelukertaa jäljellä.',
  'answer-length': 'Vastauksen pituus: {{count}} merkki.',
  'answer-length_plural': 'Vastauksen pituus: {{count}} merkkiä.',
  'answer-length-with-max-length': 'Vastauksen pituus: {{count}} / {{maxLength}} merkkiä.',
  'max-length-surplus': 'Vastauksen enimmäispituus {{maxLength}} merkkiä ylittyy {{percentage}} %.',
  'max-length-info': 'Vastauksen pituus on enintään {{count}} merkkiä. Ylityksestä seuraa pistevähennys.',
  'previous-answer-versions': 'Aiemmat vastausluonnokset',
  'zoom-in': 'Suurenna kuva',
  'end-of-exam': 'Kokeen tehtävät loppuvat tähän.',
  'start.recording': 'Äänitä vastaus',
  'stop.recording': 'Lopeta äänitys',
  'remove.recording': 'Poista äänitys',
  /**
   * These keys have the following pattern: `{question|section|toc-fi}_{childQuestionCount}_{minAnswers}_${maxAnswers}`
   * The `*` character serves as a wildcard.
   */
  'answering-instructions': {
    'exam_*_1_1': 'Vastaa kokeessa enintään yhteen tehtävään.',
    'exam_*_2_2': 'Vastaa kokeessa enintään kahteen tehtävään.',
    'exam_*_3_3': 'Vastaa kokeessa enintään kolmeen tehtävään.',
    'exam_*_4_4': 'Vastaa kokeessa enintään neljään tehtävään.',
    'exam_*_5_5': 'Vastaa kokeessa enintään viiteen tehtävään.',
    'exam_*_6_6': 'Vastaa kokeessa enintään kuuteen tehtävään.',
    'exam_*_7_7': 'Vastaa kokeessa enintään seitsemään tehtävään.',
    'exam_*_8_8': 'Vastaa kokeessa enintään kahdeksaan tehtävään.',
    'exam_*_9_9': 'Vastaa kokeessa enintään yhdeksään tehtävään.',
    'exam_*_10_10': 'Vastaa kokeessa enintään kymmeneen tehtävään.',
    'exam_*_*_*': 'Vastaa kokeessa enintään {{answerCount, range}} tehtävään.',
    'question_*_1_1': 'Vastaa yhteen kohdista {{questions, range}}.',
    'question_*_2_2': 'Vastaa kahteen kohdista {{questions, range}}.',
    'question_*_3_3': 'Vastaa kolmeen kohdista {{questions, range}}.',
    'question_*_4_4': 'Vastaa neljään kohdista {{questions, range}}.',
    'question_*_5_5': 'Vastaa viiteen kohdista {{questions, range}}.',
    'question_*_6_6': 'Vastaa kuuteen kohdista {{questions, range}}.',
    'question_*_7_7': 'Vastaa seitsemään kohdista {{questions, range}}.',
    'question_*_8_8': 'Vastaa kahdeksaan kohdista {{questions, range}}.',
    'question_*_9_9': 'Vastaa yhdeksään kohdista {{questions, range}}.',
    'question_*_10_10': 'Vastaa kymmeneen kohdista {{questions, range}}.',
    'question_2_*_1': 'Vastaa joko kohtaan {{questions, first}} tai {{questions, last}}.',
    'question_*_*_*': 'Vastaa {{answerCount, range}} kohdista {{questions, range}}.',
    'section_*_1_1': 'Vastaa yhteen tehtävään.',
    'section_*_2_2': 'Vastaa kahteen tehtävään.',
    'section_*_3_3': 'Vastaa kolmeen tehtävään.',
    'section_*_4_4': 'Vastaa neljään tehtävään.',
    'section_*_5_5': 'Vastaa viiteen tehtävään.',
    'section_*_6_6': 'Vastaa kuuteen tehtävään.',
    'section_*_7_7': 'Vastaa seitsemään tehtävään.',
    'section_*_8_8': 'Vastaa kahdeksaan tehtävään.',
    'section_*_9_9': 'Vastaa yhdeksään tehtävään.',
    'section_*_10_10': 'Vastaa kymmeneen tehtävään.',
    'section_1_*_1': 'Vastaa tehtävään {{questions, range}}.',
    'section_2_*_1': 'Vastaa joko tehtävään {{questions, first}} tai {{questions, last}}.',
    'section_*_*_*': 'Vastaa {{answerCount, range}} tehtävään.',
    'toc-section_*_1_1': 'Vastaa yhteen tehtävään.',
    'toc-section_*_2_2': 'Vastaa kahteen tehtävään.',
    'toc-section_*_3_3': 'Vastaa kolmeen tehtävään.',
    'toc-section_*_4_4': 'Vastaa neljään tehtävään.',
    'toc-section_*_5_5': 'Vastaa viiteen tehtävään.',
    'toc-section_*_6_6': 'Vastaa kuuteen tehtävään.',
    'toc-section_*_7_7': 'Vastaa seitsemään tehtävään.',
    'toc-section_*_8_8': 'Vastaa kahdeksaan tehtävään.',
    'toc-section_*_9_9': 'Vastaa yhdeksään tehtävään.',
    'toc-section_*_10_10': 'Vastaa kymmeneen tehtävään.',
    'toc-section_1_*_1': 'Vastaa tehtävään {{questions, range}}.',
    'toc-section_2_*_1': 'Vastaa joko tehtävään {{questions, first}} tai {{questions, last}}.',
    'toc-section_*_*_*': 'Vastaa {{answerCount, range}} tehtävään.'
  },
  'answer-errors': {
    'screenshot-too-big':
      'Ottamasi kuvakaappaus on liian iso. Ota uusi kuvakaappaus pienemmästä osasta näyttöä ja yritä uudelleen.',
    'screenshot-byte-limit-reached':
      'Kokeesi kuvakaappauksille varattu tila on täyttynyt. (Voit viitata aineistokuviin suoraan ilman kuvakaappausta.)',
    'screenshot-upload-failed': 'Kuvan liittäminen ei onnistunut. Kokeile uudestaan.',
    'answer-too-long': 'Vastaus on liian pitkä.'
  },
  'screen-reader': {
    'answer-begin': '[Vastaus alkaa]',
    'answer-end': '[Vastaus päättyy]',
    'correct-answer': '[Hyväksytty vastaus]'
  }
}
