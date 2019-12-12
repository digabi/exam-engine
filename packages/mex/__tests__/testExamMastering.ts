import { GenerateUuid, GetMediaMetadata, masterExam } from '@digabi/mex'
import { listExams } from '@digabi/mexamples'
import { promises as fs } from 'fs'
import { wrap } from 'jest-snapshot-serializer-raw'
import _ from 'lodash'
import path from 'path'

const generateUuid: GenerateUuid = () => '00000000-0000-0000-0000-000000000000'
const getMediaMetadata: GetMediaMetadata = async (__, type) =>
  type === 'audio' ? { duration: 999 } : { width: 999, height: 999 }

describe('Exam mastering', () => {
  it('throws an error if XML is invalid', async () => {
    const xml = await readFixture('not_xml.xml')
    return expect(masterExam(xml, generateUuid, getMediaMetadata)).rejects.toThrow(
      "Start tag expected, '<' not found\n"
    )
  })

  it('validates the XML against a schema', async () => {
    const xml = await readFixture('does_not_validate.xml')
    return expect(masterExam(xml, generateUuid, getMediaMetadata)).rejects.toThrow(
      "Element '{http://ylioppilastutkinto.fi/exam.xsd}exam-title': This element is not expected. Expected is ( {http://ylioppilastutkinto.fi/exam.xsd}languages ).\n"
    )
  })

  it('score is required for accepted-answer', async () => {
    const xml = await readFixture('accepted_answer_without_score.xml')
    return expect(masterExam(xml, generateUuid, getMediaMetadata)).rejects.toThrow(
      "Element '{http://ylioppilastutkinto.fi/exam.xsd}accepted-answer': The attribute 'score' is required but missing.\n"
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

  for (const exam of listExams()) {
    it(`masters ${path.basename(exam)} exam correctly`, async () => {
      const source = await fs.readFile(exam, 'utf-8')
      const results = await masterExam(source, generateUuid, getMediaMetadata)
      for (const result of results) {
        expect(wrap(result.xml)).toMatchSnapshot('xml')
        expect(wrap(result.hvp)).toMatchSnapshot('hvp')
        expect(_.omit(result, 'xml', 'hvp')).toMatchSnapshot()
      }
    })
  }
})

export async function readFixture(filename: string): Promise<string> {
  return fs.readFile(path.resolve(__dirname, 'fixtures', filename), 'utf-8')
}
