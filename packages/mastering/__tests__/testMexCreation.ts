import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { promises as fs } from 'fs'
import path from 'path'
import yauzl from 'yauzl-promise'
import { Readable, PassThrough } from 'stream'
import { createMex, AttachmentFile, createMultiMex, ExamFile, REQUIRED_SERVER_VERSION_FILENAME } from '../src/createMex'
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
    async function expectCorrectMexIsCreated(koeUpdate?: Readable, nsaScriptsOverride: Readable | null = nsaScripts) {
      const { mexStream, mexBuffers } = getMexStreamAndBuffers()
      await createMex(
        xml,
        attachments,
        nsaScriptsOverride,
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
        uncompressedSize: e.uncompressedSize
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

    it('does not add nsa scripts when none are provided', async () => {
      const mexEntries = await expectCorrectMexIsCreated(undefined, null)
      expect(mexEntries.find(e => e.filename === 'nsa.zip.bin')).toBeUndefined()
      expect(mexEntries.find(e => e.filename === 'nsa.zip.bin.sig')).toBeUndefined()
    })

    it('does not add a required-server-version manifest when no required version is given', async () => {
      const mexEntries = await expectCorrectMexIsCreated()
      expect(mexEntries.find(e => e.filename === REQUIRED_SERVER_VERSION_FILENAME)).toBeUndefined()
    })

    it('adds an unencrypted, signed required-server-version manifest when a required version is given', async () => {
      const requiredServerVersion = '1.54.4'
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
        requiredServerVersion
      )
      const mexEntries = await expectZipEntriesAreCorrect(mexBuffers, e => ({
        fileName: e.filename,
        uncompressedSize: e.uncompressedSize
      }))

      const manifest = await toBuffer(
        await mexEntries.find(e => e.filename === REQUIRED_SERVER_VERSION_FILENAME)!.openReadStream()
      )
      const manifestSignature = (
        await toBuffer(
          await mexEntries.find(e => e.filename === `${REQUIRED_SERVER_VERSION_FILENAME}.sig`)!.openReadStream()
        )
      ).toString('utf8')

      // The manifest is plaintext JSON (not encrypted) so the server can read it before decryption.
      expect(JSON.parse(manifest.toString('utf8'))).toEqual({ requiredServerVersion })
      // The signature is over the plaintext bytes and verifies with the public key (no passphrase needed).
      expect(verifyWithSHA256AndRSA(manifest, publicKey, manifestSignature)).toBeTruthy()
    })

    it('rejects when an attachment stream aborts', async () => {
      const { mexStream } = getMexStreamAndBuffers()
      mexStream.resume()

      await expect(
        createMex(
          xml,
          [{ filename: 'attachment.txt', contents: abortingReadable(), restricted: false }],
          nsaScripts,
          null,
          passphrase,
          privateKey,
          mexStream
        )
      ).rejects.toThrow('aborted')
    }, 5_000)

    it('rejects when a nsa scripts stream aborts', async () => {
      const { mexStream } = getMexStreamAndBuffers()
      mexStream.resume()

      await expect(
        createMex(xml, attachments, abortingReadable(), null, passphrase, privateKey, mexStream)
      ).rejects.toThrow('aborted')
    }, 5_000)
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

    it('rejects when an exam stream aborts', async () => {
      const { mexStream } = getMexStreamAndBuffers()
      mexStream.resume()

      await expect(
        createMultiMex(
          [{ filename: 'exam.mex', contents: abortingReadable() }],
          nsaScripts,
          securityCodes,
          passphrase,
          privateKey,
          mexStream
        )
      ).rejects.toThrow('aborted')
    }, 5_000)
  })
})

function abortingReadable(): Readable {
  let started = false

  return new Readable({
    read() {
      if (started) return
      started = true
      this.push('partial data')
      setImmediate(() => this.destroy(new Error('aborted')))
    }
  })
}

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
