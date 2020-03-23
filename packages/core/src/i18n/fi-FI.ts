import { DeepPartial } from 'utility-types'

export type Translations = typeof fi_FI
export type ExamTranslations = DeepPartial<Translations>

// tslint:disable-next-line:variable-name
export const fi_FI = {
  'exam-total': 'Koe yhteensä',
  'grading-total': 'Yhteensä',
  material: 'Aineisto',
  material_plural: 'Aineistot',
  'attachments-page-title': 'aineisto',
  'external-material-title': 'Aineisto',
  question: '{{displayNumber}}',
  part: 'Osa {{displayNumber}}:',
  grade: 'Arvosana',
  comment: 'Kommentti',
  points: '{{count}} p.',
  points_plural: '{{count}} p.',
  'points-screen-reader': '{{count}} piste',
  'points-screen-reader_plural': '{{count}} pistettä',
  'audio-errors': {
    'already-accessed': 'Olet jo toistanut tämän tallenteen. Päivitä sivu.',
    'already-playing': 'Kuuntele ensin äänite loppuun.',
    'other-error': 'Tallenteen toistaminen epäonnistui, pyydä apua valvojalta.'
  },
  'audio-test': {
    instructions: 'Koe sisältää kuullunymmärtämisen tehtäviä.',
    play: 'Testaa äänitteiden kuuluvuus',
    volume: 'Äänen voimakkuutta voit säätää ruudun oikeasta yläkulmasta.'
  },
  grading: {
    'pregrading-annotations': 'Valmistavan arvostelun merkinnät',
    'censor-annotations': 'Sensorin merkinnät'
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
    forbidden: {
      infoText: 'Saat estetyt laskinohjelmat käyttöön palautettuasi A-osan.',
      buttonText: 'Palauta A-osa'
    },
    allowing: {
      infoText: 'A-osan vastaukset lukitaan. Saat estetyt laskinohjelmat käyttöösi hetken kuluttua.',
      buttonText: 'Peruuta ({{count}}s)'
    },
    allowed: {
      infoText: 'A-osa palautettu'
    }
  },
  'toc-heading': 'Sisällys',
  'answer-saved': 'Tallennettu',
  'listen-times-remaining': '{{count}} kuuntelukerta jäljellä.',
  'listen-times-remaining_plural': '{{count}} kuuntelukertaa jäljellä.',
  'answer-length': 'Vastauksen pituus: {{count}} merkki.',
  'answer-length_plural': 'Vastauksen pituus: {{count}} merkkiä.',
  'previous-answer-versions': 'Aiemmat vastausluonnokset',
  'zoom-in': 'Suurenna',
  /**
   * These keys have the following pattern: `{question|section|toc-fi}_{childQuestionCount}_{minAnswers}_${maxAnswers}`
   * The `*` character serves as a wildcard.
   */
  'answering-instructions': {
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
    'screenshot-limit-exceeded': 'Vastaukseen voi liittää enintään {{limit}} kuvaa.',
    'screenshot-too-big':
      'Ottamasi kuvakaappaus on liian iso. Ota uusi kuvakaappaus pienemmästä osasta näyttöä ja yritä uudelleen.',
    'screenshot-byte-limit-reached':
      'Kokeesi kuvakaappauksille varattu tila on täyttynyt. (Voit viitata aineistokuviin suoraan ilman kuvakaappausta.)',
    'screenshot-upload-failed': 'Kuvan liittäminen ei onnistunut. Kokeile uudestaan.'
  }
}
