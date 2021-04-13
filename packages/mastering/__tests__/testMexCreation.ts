import { promises as fs } from 'fs'
import path from 'path'
import yauzl from 'yauzl-promise'
import { Readable, PassThrough } from 'stream'
import { createMex, AttachmentFile, createMultiMex, ExamFile } from '../dist/createMex'
import { verifyWithSHA256AndRSA } from '../src/crypto-utils'

interface InterestingEntryMetadata {
  fileName: string
  uncompressedSize: number
}

describe('Mex exam package creation', () => {
  let privateKey: string
  let publicKey: string
  let nsaScripts: Readable
  let securityCodes: Readable
  let exams: ExamFile[]

  beforeAll(async () => {
    privateKey = await readResource('private-key.pem')
    publicKey = await readResource('public-key.pem')
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
  ): Promise<yauzl.Entry[]> {
    const zip = await yauzl.fromBuffer(Buffer.concat(mexBuffers))
    const rawEntries = await zip.readEntries()
    const mappedEntries = rawEntries.map(entryMapper)
    expect(mappedEntries).toMatchSnapshot()
    return rawEntries
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
      return await expectZipEntriesAreCorrect(mexBuffers, (e) => ({
        fileName: e.fileName,
        uncompressedSize: e.fileName === 'rendering.zip.bin' ? 0 : e.uncompressedSize, // ignore rendering.zip size
      }))
    }

    it('creates a minimal mex with verifyable exam.xml signature', async () => {
      const mexEntries = await expectCorrectMexIsCreated()
      const encryptedExamXml = await toBuffer(
        await mexEntries.find((e) => e.fileName === 'exam.xml.bin')!.openReadStream()
      )
      const encryptedExamXmlSignature = (
        await toBuffer(await mexEntries.find((e) => e.fileName === 'exam.xml.bin.sig')!.openReadStream())
      ).toString('utf8')

      const signatureVerificationResult = verifyWithSHA256AndRSA(encryptedExamXml, publicKey, encryptedExamXmlSignature)
      expect(signatureVerificationResult).toBeTruthy()
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

function toBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve) => {
    const buffers: Buffer[] = []
    stream.on('data', (d) => buffers.push(d))
    stream.on('end', () => resolve(Buffer.concat(buffers)))
  })
}
