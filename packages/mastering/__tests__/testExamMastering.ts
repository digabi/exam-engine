import { listExams } from '@digabi/exam-engine-exams'
import { choiceAnswer, dropdownAnswer, generateExam, question, textAnswer } from '@digabi/exam-engine-generator'
import { GenerateUuid, GetMediaMetadata, masterExam } from '@digabi/exam-engine-mastering'
import { promises as fs } from 'fs'
import { wrap } from 'jest-snapshot-serializer-raw'
import _ from 'lodash'
import path from 'path'
import { readFixture } from './fixtures'

const generateUuid: GenerateUuid = () => '00000000-0000-0000-0000-000000000000'
const getMediaMetadata: GetMediaMetadata = async (__, type) =>
  Promise.resolve(type === 'audio' ? { duration: 999 } : { width: 999, height: 999 })

describe('Exam mastering', () => {
  describe('throws an error if', () => {
    it('XML is invalid', async () => {
      const xml = await readFixture('not_xml.xml')
      return expect(masterExam(xml, generateUuid, getMediaMetadata)).rejects.toThrow(
        "Start tag expected, '<' not found\n"
      )
    })
    it('XML has invalid exam code', async () => {
      const xml = await readFixture('invalid_exam_code.xml')
      return expect(masterExam(xml, generateUuid, getMediaMetadata)).rejects.toThrow(
        'Invalid exam-code BI for day-code X'
      )
    })
    it('XML has invalid day code', async () => {
      const xml = await readFixture('invalid_day_code.xml')
      return expect(masterExam(xml, generateUuid, getMediaMetadata)).rejects.toThrow(
        "The value 'Z' is not an element of the set"
      )
    })
    it('XML has invalid empty day code', async () => {
      const xml = await readFixture('invalid_empty_day_code.xml')
      return expect(masterExam(xml, generateUuid, getMediaMetadata)).rejects.toThrow(
        'Invalid empty day-code for exam-code A'
      )
    })
    it('other than first section is cas restricted', async () => {
      const xml = await readFixture('cas.xml')
      expect(await masterExam(xml, generateUuid, getMediaMetadata)).toHaveLength(1)
      expect(
        await masterExam(
          xml.replace(/<e:section cas-forbidden="true">/g, '<e:section>'),
          generateUuid,
          getMediaMetadata
        )
      ).toHaveLength(1)
      await expect(
        masterExam(
          xml.replace(/<e:section cas-forbidden="false">/g, '<e:section cas-forbidden="true">'),
          generateUuid,
          getMediaMetadata
        )
      ).rejects.toThrow('cas-forbidden attribute can be true only on first section')
      return expect(
        masterExam(xml.replace(/<e:section>/g, '<e:section cas-forbidden="true">'), generateUuid, getMediaMetadata)
      ).rejects.toThrow('cas-forbidden attribute can be true only on first section')
    })
    it('XML has missing attachment', async () => {
      const xml = await readFixture('missing_attachments.xml')
      return expect(masterExam(xml, generateUuid, getMediaMetadata)).rejects.toThrow(
        'Reference "1A" not found from available attachments: [] (fi-FI, visually-impaired)'
      )
    })
    it('has non-rich text questions with a max length', async () => {
      const xml = await readFixture('unallowed_max_length.xml')
      return expect(masterExam(xml, generateUuid, getMediaMetadata)).rejects.toThrow(
        'Only text answers with the type "rich-text" can have a max length'
      )
    })
  })

  it('validates the XML against a schema', async () => {
    const xml = await readFixture('does_not_validate.xml')
    return expect(masterExam(xml, generateUuid, getMediaMetadata)).rejects.toThrow(
      "Element '{http://ylioppilastutkinto.fi/exam.xsd}exam-title': This element is not expected. Expected is ( {http://ylioppilastutkinto.fi/exam.xsd}exam-versions ).\n"
    )
  })

  it('does not substitute entities', async () => {
    const xml = await readFixture('has_entities.xml')
    return expect(masterExam(xml, generateUuid, getMediaMetadata)).rejects.toThrow(
      'Internal error: xmlSchemaVDocWalk, there is at least one entity reference in the node-tree currently being validated. Processing of entities with this XML Schema processor is not supported (yet). Please substitute entities before validation..\n'
    )
  })

  it('validates that all answers are directly under a question', async () => {
    const xml = await readFixture('answer_not_under_question.xml')
    return expect(masterExam(xml, generateUuid, getMediaMetadata)).rejects.toThrow(
      'All answers must be within a question.'
    )
  })

  it('validates that a question may not contain both answers and child questions', async () => {
    const xml = await readFixture('question_containing_both_subquestions_and_answers.xml')
    return expect(masterExam(xml, generateUuid, getMediaMetadata)).rejects.toThrow(
      'A question may not contain both answer elements and child questions'
    )
  })

  it('validates that a scored-text-answer must have either a max-score attribute or an accepted-answer', async () => {
    const xml = await readFixture('accepted_answer_without_score.xml')
    return expect(masterExam(xml, generateUuid, getMediaMetadata)).rejects.toThrow(
      'A scored-text-answer element must contain either a max-score attribute or contain accepted-answers'
    )
  })

  it('validates that the max-score of a scored-text-answer is not smaller than the score of its accepted-answer', async () => {
    const xml = await readFixture('accepted_answer_with_too_high_score.xml')
    return expect(masterExam(xml, generateUuid, getMediaMetadata)).rejects.toThrow(
      'The max-score of a scored-text-answer cannot be smaller than the score of some of its accepted-answers'
    )
  })

  it('calls generateUuid with exam metadata if it is an yo exam', async () => {
    const xml = await readFixture('minimal_yo_exam.xml')
    const spy = jest.fn(generateUuid)
    await masterExam(xml, spy, getMediaMetadata)
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy.mock.calls[0]).toEqual([
      {
        examCode: 'A',
        date: '2020-01-01',
        language: 'fi-FI',
        type: 'normal'
      }
    ])
    expect(spy.mock.calls[1]).toEqual([
      {
        examCode: 'A',
        date: '2020-01-01',
        language: 'sv-FI',
        type: 'normal'
      }
    ])
  })

  it('supports multiple exam-type attributes', async () => {
    const xml = await readFixture('multiple_exam_types.xml')
    const masteringResults = await masterExam(xml, generateUuid, getMediaMetadata)

    for (const masteringResult of masteringResults) {
      expect(wrap(masteringResult.xml)).toMatchSnapshot(masteringResult.type)
    }
  })

  it('removes metadata by default', async () => {
    const xml = await readFixture('exam_with_metadata.xml')
    const masteringResults = await masterExam(xml, generateUuid, getMediaMetadata)
    expect(masteringResults[0].xml).not.toContain('meta')
  })

  it('leaves metadata when needed', async () => {
    const xml = await readFixture('exam_with_metadata.xml')
    const masteringResults = await masterExam(xml, generateUuid, getMediaMetadata, { removeMetadata: false })
    expect(masteringResults[0].xml).toContain('meta')
  })

  it('does not combine choice-answers and dropdown-answers to the same question in grading structure', async () => {
    const xml = generateExam({
      sections: [{ questions: [question([choiceAnswer(), dropdownAnswer()])] }]
    })
    const [masteringResult] = await masterExam(xml, generateUuid, getMediaMetadata)
    expect(masteringResult.gradingStructure.questions).toMatchObject([
      {
        type: 'choicegroup',
        displayNumber: '1.1',
        choices: [{ type: 'choice', displayNumber: '1.1' }]
      },
      {
        type: 'choicegroup',
        displayNumber: '1.2',
        choices: [{ type: 'choice', displayNumber: '1.2' }]
      }
    ])
  })

  it('combines choice-answers and dropdown-answers to the same question in grading structure when groupChoiceAnswers option is set', async () => {
    const xml = generateExam({ sections: [{ questions: [question([choiceAnswer(), dropdownAnswer()])] }] })
    const [masteringResult] = await masterExam(xml, generateUuid, getMediaMetadata, { groupChoiceAnswers: true })
    expect(masteringResult.gradingStructure.questions).toMatchObject([
      {
        type: 'choicegroup',
        displayNumber: '1',
        choices: [
          { type: 'choice', displayNumber: '1.1' },
          { type: 'choice', displayNumber: '1.2' }
        ]
      }
    ])
  })

  it('supports arbitrarily nested questions', async () => {
    const xml = generateExam({
      sections: [
        {
          questions: [
            question([question([textAnswer()]), question([textAnswer()])]),
            question([question([question([textAnswer()]), question([textAnswer()])])]),
            question([question([question([question([textAnswer()]), question([textAnswer()])])])])
          ]
        }
      ]
    })
    const [masteringResult] = await masterExam(xml, generateUuid, getMediaMetadata)
    expect(wrap(masteringResult.xml)).toMatchSnapshot('xml')
  })

  it('shuffles choice answers but keeps no-answer options last', async () => {
    const xml = await readFixture('choice_answer_with_no_answer.xml')
    const [masteringResult] = await masterExam(xml, generateUuid, getMediaMetadata)
    expect(wrap(masteringResult.xml)).toMatchSnapshot()
  })

  it('adds a suffix to exam title for special exams', async () => {
    const xml = generateExam({
      examCode: 'EA',
      examVersions: [
        { language: 'fi-FI', type: 'normal' },
        { language: 'fi-FI', type: 'visually-impaired' },
        { language: 'fi-FI', type: 'hearing-impaired' }
      ],
      sections: [
        {
          questions: [question([textAnswer()])]
        }
      ]
    })
    const masteringResults = await masterExam(xml, generateUuid, getMediaMetadata)
    const titles = masteringResults.map(r => r.title)
    expect(titles).toEqual([
      'FI – Englanti, pitkä oppimäärä',
      'FI – Englanti, pitkä oppimäärä (näkövammaiset)',
      'FI – Englanti, pitkä oppimäärä (kuulovammaiset)'
    ])
  })

  for (const exam of listExams()) {
    it(`masters ${path.basename(exam)} exam correctly`, async () => {
      const source = await fs.readFile(exam, 'utf-8')
      const results = await masterExam(source, generateUuid, getMediaMetadata)
      for (const result of results) {
        expect(wrap(result.xml)).toMatchSnapshot('xml')
        expect(wrap(result.translation)).toMatchSnapshot('translation')
        expect(_.omit(result, 'xml', 'translation')).toMatchSnapshot()
      }
    })
  }
})
