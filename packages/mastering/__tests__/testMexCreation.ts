import { promises as fs } from 'fs'
import path from 'path'
import yauzl from 'yauzl-promise'
import { Readable, PassThrough } from 'stream'
import { createMex, AttachmentFile, createMultiMex, ExamFile } from '../dist/createMex'

interface InterestingEntryMetadata {
  fileName: string
  uncompressedSize: number
}

describe('Mex exam package creation', () => {
  let privateKey: string
  let nsaScripts: Readable
  let securityCodes: Readable
  let exams: ExamFile[]

  beforeAll(async () => {
    privateKey = await readResource('private-key.pem')
  })

  beforeEach(() => {
    nsaScripts = Readable.from(['mock nsa scripts'])
    securityCodes = Readable.from(['mock security codes'])
    exams = [
      {
        filename: 'exam_a.mex',
        contents: Readable.from(['mock exam A']),
      },
      {
        filename: 'exam_b.mex',
        contents: Readable.from(['mock exam B']),
      },
    ]
  })

  const xml = 'mock xml'
  const attachments: AttachmentFile[] = []
  const loadSimulationConfiguration = undefined
  const passphrase = 'kellohalli'
  const ktpUpdate = undefined

  function getMexStreamAndBuffers() {
    const mexStream = new PassThrough()
    const mexBuffers: Buffer[] = []
    mexStream.on('data', (data) => {
      mexBuffers.push(data)
    })
    return { mexStream, mexBuffers }
  }

  async function expectZipEntriesAreCorrect(
    mexBuffers: Buffer[],
    entryMapper: (value: yauzl.Entry, index: number, array: yauzl.Entry[]) => InterestingEntryMetadata
  ) {
    const zip = await yauzl.fromBuffer(Buffer.concat(mexBuffers))
    const rawEntries = await zip.readEntries()
    const mappedEntries = rawEntries.map(entryMapper)
    expect(mappedEntries).toMatchSnapshot()
  }

  describe('with createMex', () => {
    async function expectCorrectMexIsCreated(koeUpdate?: Readable) {
      const { mexStream, mexBuffers } = getMexStreamAndBuffers()
      await createMex(
        xml,
        attachments,
        nsaScripts,
        null,
        passphrase,
        privateKey,
        mexStream,
        undefined,
        ktpUpdate,
        koeUpdate
      )
      await expectZipEntriesAreCorrect(mexBuffers, (e) => ({
        fileName: e.fileName,
        uncompressedSize: e.fileName === 'rendering.zip.bin' ? 0 : e.uncompressedSize, // ignore rendering.zip size
      }))
    }

    it('creates a minimal mex', async () => {
      await expectCorrectMexIsCreated()
    })

    it('creates a mex with koe-update.zip', async () => {
      const koeUpdate = Readable.from(['mock koe-update.zip'])
      await expectCorrectMexIsCreated(koeUpdate)
    })
  })

  describe('with createMultiMex', () => {
    async function expectCorrectMultiMexIsCreated(koeUpdate?: Readable) {
      const { mexStream, mexBuffers } = getMexStreamAndBuffers()
      await createMultiMex(
        exams,
        nsaScripts,
        securityCodes,
        passphrase,
        privateKey,
        mexStream,
        loadSimulationConfiguration,
        ktpUpdate,
        koeUpdate
      )
      await expectZipEntriesAreCorrect(mexBuffers, (e) => ({
        fileName: e.fileName,
        uncompressedSize: e.uncompressedSize,
      }))
    }

    it('creates a minimal multimex', async () => {
      await expectCorrectMultiMexIsCreated()
    })

    it('creates a multimex with koe-update.zip', async () => {
      const koeUpdate = Readable.from(['mock koe-update.zip'])
      await expectCorrectMultiMexIsCreated(koeUpdate)
    })
  })
})

async function readResource(filename: string): Promise<string> {
  return fs.readFile(path.resolve(__dirname, 'resources', filename), 'utf-8')
}
