import { DeepPartial } from 'utility-types'

/** A helper type for type-safe i18next translations. */
type ExtractTranslations<T> = {
  [K in keyof T as K extends `${string}_plural` ? never : K]: ExtractTranslations<T[K]>
} &
  {
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
  section: 'Osa {{displayNumber}}:',
  question: 'Tehtävä {{displayNumber}}:',
  grade: 'Arvosana',
  comment: 'Kommentti',
  points: '{{count}} p.',
  audio: {
    play: 'Kuuntele äänite.',
  },
  'audio-errors': {
    'already-accessed': 'Olet jo toistanut tämän äänitteen. Päivitä sivu.',
    'already-playing': 'Kuuntele äänite ensin loppuun.',
    'other-error': 'Äänitteen toistaminen epäonnistui, pyydä apua valvojalta.',
  },
  'audio-test': {
    instructions: 'Koe sisältää kuullunymmärtämisen tehtäviä.',
    play: 'Testaa äänitteiden kuuluvuus',
    volume: 'Äänen voimakkuutta voit säätää ruudun oikeasta yläkulmasta.',
  },
  'dropdown-answer': {
    label: 'Valitse parhaiten sopiva vaihtoehto.',
    clear: 'Poista valinta.',
  },
  grading: {
    'pregrading-annotations': 'Valmistavan arvostelun merkinnät',
    'censor-annotations': 'Sensorin merkinnät',
  },
  references: {
    heading: 'Lähteet',
    source: 'Lähde:',
    date: 'Julkaistu:',
    'reference-date': 'Viitattu:',
    translator: 'Käännös:',
    'modified-by': 'Muokkaus:',
  },
  cas: {
    forbidden: {
      infoText: 'Saat estetyt laskinohjelmat käyttöön palautettuasi A-osan.',
      buttonText: 'Palauta A-osa',
    },
    allowing: {
      infoText: 'A-osan vastaukset lukitaan. Saat estetyt laskinohjelmat käyttöösi hetken kuluttua.',
      buttonText: 'Peruuta ({{count}}s)',
    },
    allowed: {
      infoText: 'A-osa palautettu',
    },
  },
  'toc-heading': 'Sisällys',
  'answer-saved': 'Tallennettu',
  'too-many-answers': 'Vastattu liiaan moneen tehtävään:',
  'listen-times-remaining': '{{count}} kuuntelukerta jäljellä.',
  'listen-times-remaining_plural': '{{count}} kuuntelukertaa jäljellä.',
  'answer-length': 'Vastauksen pituus: {{count}} merkki.',
  'answer-length_plural': 'Vastauksen pituus: {{count}} merkkiä.',
  'previous-answer-versions': 'Aiemmat vastausluonnokset',
  'zoom-in': 'Suurenna kuva',
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
    'toc-section_*_*_*': 'Vastaa {{answerCount, range}} tehtävään.',
  },
  'answer-errors': {
    'screenshot-too-big':
      'Ottamasi kuvakaappaus on liian iso. Ota uusi kuvakaappaus pienemmästä osasta näyttöä ja yritä uudelleen.',
    'screenshot-byte-limit-reached':
      'Kokeesi kuvakaappauksille varattu tila on täyttynyt. (Voit viitata aineistokuviin suoraan ilman kuvakaappausta.)',
    'screenshot-upload-failed': 'Kuvan liittäminen ei onnistunut. Kokeile uudestaan.',
  },
  'screen-reader': {
    'answer-begin': '[Vastaus alkaa]',
    'answer-end': '[Vastaus päättyy]',
    'correct-answer': '[Hyväksytty vastaus]',
  },
}
