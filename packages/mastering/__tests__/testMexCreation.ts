import { promises as fs } from 'fs'
import path from 'path'
import yauzl from 'yauzl-promise'
import { Readable, PassThrough } from 'stream'
import { createMex, AttachmentFile, createMultiMex, ExamFile, MIN_SERVER_VERSION_FILENAME } from '../dist/createMex'
import { verifyWithSHA256AndRSA } from '../src/crypto-utils'

interface YauzlEntryV4 extends yauzl.Entry {
  filename: string
}

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
        contents: Readable.from(['mock exam A'])
      },
      {
        filename: 'exam_b.mex',
        contents: Readable.from(['mock exam B'])
      }
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
    mexStream.on('data', (data: Buffer) => {
      mexBuffers.push(data)
    })
    return { mexStream, mexBuffers }
  }

  async function expectZipEntriesAreCorrect(
    mexBuffers: Buffer[],
    entryMapper: (value: YauzlEntryV4, index: number, array: YauzlEntryV4[]) => InterestingEntryMetadata
  ): Promise<YauzlEntryV4[]> {
    const zip = await yauzl.fromBuffer(Buffer.concat(mexBuffers))
    const rawEntries = (await zip.readEntries()) as YauzlEntryV4[]
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
      return await expectZipEntriesAreCorrect(mexBuffers, e => ({
        fileName: e.filename,
        uncompressedSize: e.filename === 'rendering.zip.bin' ? 0 : e.uncompressedSize // ignore rendering.zip size
      }))
    }

    it('creates a minimal mex with verifyable exam.xml signature', async () => {
      const mexEntries = await expectCorrectMexIsCreated()
      const encryptedExamXml = await toBuffer(
        await mexEntries.find(e => e.filename === 'exam.xml.bin')!.openReadStream()
      )
      const encryptedExamXmlSignature = (
        await toBuffer(await mexEntries.find(e => e.filename === 'exam.xml.bin.sig')!.openReadStream())
      ).toString('utf8')

      const signatureVerificationResult = verifyWithSHA256AndRSA(encryptedExamXml, publicKey, encryptedExamXmlSignature)
      expect(signatureVerificationResult).toBeTruthy()
    })

    it('creates a mex with koe-update.zip', async () => {
      const koeUpdate = Readable.from(['mock koe-update.zip'])
      await expectCorrectMexIsCreated(koeUpdate)
    })

    it('does not add a min-server-version manifest when no minimum version is given', async () => {
      const mexEntries = await expectCorrectMexIsCreated()
      expect(mexEntries.find(e => e.filename === MIN_SERVER_VERSION_FILENAME)).toBeUndefined()
    })

    it('adds an unencrypted, signed min-server-version manifest when a minimum version is given', async () => {
      const minServerVersion = '1.54.4'
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
        undefined,
        minServerVersion
      )
      const mexEntries = await expectZipEntriesAreCorrect(mexBuffers, e => ({
        fileName: e.filename,
        uncompressedSize: e.filename === 'rendering.zip.bin' ? 0 : e.uncompressedSize
      }))

      const manifest = await toBuffer(
        await mexEntries.find(e => e.filename === MIN_SERVER_VERSION_FILENAME)!.openReadStream()
      )
      const manifestSignature = (
        await toBuffer(
          await mexEntries.find(e => e.filename === `${MIN_SERVER_VERSION_FILENAME}.sig`)!.openReadStream()
        )
      ).toString('utf8')

      // The manifest is plaintext JSON (not encrypted) so the server can read it before decryption.
      expect(JSON.parse(manifest.toString('utf8'))).toEqual({ minServerVersion })
      // The signature is over the plaintext bytes and verifies with the public key (no passphrase needed).
      expect(verifyWithSHA256AndRSA(manifest, publicKey, manifestSignature)).toBeTruthy()
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

      await expectZipEntriesAreCorrect(mexBuffers, e => ({
        fileName: e.filename,
        uncompressedSize: e.uncompressedSize
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
  return new Promise(resolve => {
    const buffers: Buffer[] = []
    stream.on('data', (d: Buffer) => buffers.push(d))
    stream.on('end', () => resolve(Buffer.concat(buffers)))
  })
}
