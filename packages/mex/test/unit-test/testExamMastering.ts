import chai, { assert } from 'chai'
import chaiJestDiff from 'chai-jest-diff'
import * as R from 'ramda'
import sinon, { assert as sinonAssert } from 'sinon'
import { readFixture, writeFixture } from '../../../../test/fixtures'
import { masterExam } from '../../src/mastering'

chai.use(chaiJestDiff)

interface Attachment {
  filename: string
  restricted: boolean
}

interface TestResultData {
  language: string
  filename: string
  attachments: Attachment[]
}

const mkAttachment = (filename: string, restricted: boolean = false): Attachment => ({ filename, restricted })
const generateUuid = (_?: {
  examCode: string
  date: string
  language: string
  type: 'normal' | 'visually-impaired' | 'scanner'
}) => '00000000-0000-0000-0000-000000000000'
const getMediaMetadata = async (_: string, type: 'video' | 'audio' | 'image') => {
  if (type === 'audio') {
    return { duration: 999 }
  } else {
    return { width: 999, height: 999 }
  }
}

describe('Exam mastering', () => {
  it('throws an error if XML is invalid', async () => {
    const xml = await readFixture('not_xml.xml')
    return assertRejected(masterExam(xml, generateUuid, getMediaMetadata), "Start tag expected, '<' not found\n")
  })

  it('validates the XML against a schema', async () => {
    const xml = await readFixture('does_not_validate.xml')
    return assertRejected(
      masterExam(xml, generateUuid, getMediaMetadata),
      "Element '{http://ylioppilastutkinto.fi/exam.xsd}exam-title': This element is not expected. Expected is ( {http://ylioppilastutkinto.fi/exam.xsd}languages ).\n"
    )
  })

  it('score is required for accepted-answer', async () => {
    const xml = await readFixture('accepted_answer_without_score.xml')
    return assertRejected(
      masterExam(xml, generateUuid, getMediaMetadata),
      "Element '{http://ylioppilastutkinto.fi/exam.xsd}accepted-answer': The attribute 'score' is required but missing.\n"
    )
  })

  it('does not substitute entities', async () => {
    const xml = await readFixture('has_entities.xml')
    return assertRejected(
      masterExam(xml, generateUuid, getMediaMetadata),
      'Internal error: xmlSchemaVDocWalk, there is at least one entity reference in the node-tree currently being validated. Processing of entities with this XML Schema processor is not supported (yet). Please substitute entities before validation..\n'
    )
  })

  it('calls generateUuid with exam metadata if it is an yo exam', async () => {
    const xml = await readFixture('minimal_yo_exam.xml')
    const spy = sinon.spy(generateUuid)
    await masterExam(xml, spy, getMediaMetadata)
    sinonAssert.callCount(spy, 2)
    sinonAssert.calledWith(spy.firstCall, {
      examCode: 'A',
      date: '2020-01-01',
      language: 'fi-FI',
      type: 'normal'
    })
    sinonAssert.calledWith(spy.secondCall, {
      examCode: 'A',
      date: '2020-01-01',
      language: 'sv-FI',
      type: 'normal'
    })
  })

  it('masters the A_X exam correctly', async () => {
    await assertMasteredExams('../../exams/A_X/A_X.xml', [
      {
        language: 'fi-FI',
        filename: 'A_X/A_X_fi-FI.xml',
        attachments: [
          mkAttachment('1.A.webm'),
          mkAttachment('1.A_KV.webm'),
          mkAttachment('2.A.ogg'),
          mkAttachment('4.A.ogg')
        ]
      }
    ])
  })

  it('masters the exam with exam-specific external material correctly', async () => {
    await assertMasteredExams('exam_specific_external_material.xml', [
      {
        language: 'fi-FI',
        filename: 'exam_specific_external_material_fi-FI.xml',
        attachments: []
      }
    ])
  })

  it('masters the FF exam structure correctly', async () => {
    await assertMasteredExams('../../exams/FF/FF.xml', [
      {
        language: 'fi-FI',
        filename: 'FF/FF_fi-FI.xml',
        attachments: [
          mkAttachment('T3_FI.webm'),
          mkAttachment('4A.jpg'),
          mkAttachment('4B.png'),
          mkAttachment('T5_FI.webm'),
          mkAttachment('T9_1_FI.webm'),
          mkAttachment('T9_2_FI.webm')
        ]
      },
      {
        language: 'sv-FI',
        filename: 'FF/FF_sv-FI.xml',
        attachments: [
          mkAttachment('T3_SV.webm'),
          mkAttachment('4A.jpg'),
          mkAttachment('4B.png'),
          mkAttachment('T5_SV.webm'),
          mkAttachment('T9_1_SV.webm'),
          mkAttachment('T9_2_SV.webm')
        ]
      }
    ])
  })

  it('masters the EA exam structure correctly', async () => {
    await assertMasteredExams('../../exams/EA/EA.xml', [
      {
        language: 'fi-FI',
        filename: 'EA/EA_fi-FI.xml',
        attachments: [mkAttachment('audio-test.ogg'), mkAttachment('1.mp3', true), mkAttachment('1.1.mp3', true)]
      }
    ])
  })

  it('masters the M exam structure correctly', async () => {
    await assertMasteredExams('../../exams/M/M.xml', [
      {
        language: 'fi-FI',
        filename: 'M/M_fi-FI.xml',
        attachments: []
      }
    ])
  })

  it('masters the MexDocumentation correctly', async () => {
    await assertMasteredExams('../../exams/MexDocumentation/MexDocumentation.xml', [
      {
        language: 'fi-FI',
        filename: 'MexDocumentation/MexDocumentation-FI.xml',
        attachments: [
          mkAttachment('example_high.jpg'),
          mkAttachment('example.jpg'),
          mkAttachment('example_small.jpg'),
          mkAttachment('example1.webm'),
          mkAttachment('example1.webm', true),
          mkAttachment('example2.webm', true),
          mkAttachment('example3.webm', true),
          mkAttachment('custom.css')
        ]
      }
    ])
  })
})

async function assertMasteredExams(sourceFilename: string, testResult: TestResultData[]) {
  const source = await readFixture(sourceFilename)
  const results = await masterExam(source, generateUuid, getMediaMetadata)

  for (const { language, filename, attachments } of testResult) {
    const result = results.find(R.whereEq({ language }))!

    if (process.env.OVERWRITE_FIXTURES) {
      await writeFixture(filename, result.xml)
    }

    const expectedXml = await readFixture(filename)

    assert.deepStrictEqual(result.xml, expectedXml, `XML mismatch for ${language}`)
    assert.deepStrictEqual(result.attachments, attachments)
  }
}

async function assertRejected<T>(promise: Promise<T>, message?: string) {
  try {
    await promise
  } catch (err) {
    // Everything ok, it threw.
    if (message) {
      return assert.equal(message, err.message)
    } else {
      return
    }
  }

  throw new Error(`Promise ${promise} was not rejected`)
}
