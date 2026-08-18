import fs from 'fs'
import path from 'path'
import stream, { Readable, Writable } from 'stream'
import yazl, { ZipFile } from 'yazl'
import { createAES256EncryptStreamWithIv, deriveAES256KeyAndIv, KeyAndIv, signWithSHA256AndRSA } from './crypto-utils'
import cloneable from 'cloneable-readable'
import { promisify } from 'util'
import { glob } from 'glob'

const pipeline = promisify(stream.pipeline)

/**
 * Name of the top-level, unencrypted but signed manifest that declares the
 * KTP server version the package requires.
 */
export const REQUIRED_SERVER_VERSION_FILENAME = 'required-server-version.json'

export interface ExamFile {
  /** A relative filename (e.g. "foo.mp3"). This should be the same filename than in the exam XML. */
  filename: string
  /** A ReadableStream of the file contents */
  contents: Readable
}

export interface AttachmentFile extends ExamFile {
  /** Whether this attachment is restricted or not. */
  restricted: boolean
}

export async function createMex(
  xml: string,
  attachments: AttachmentFile[],
  nsaScripts: Readable,
  securityCodes: Readable | null,
  passphrase: string,
  answersPrivateKey: string,
  outputStream: Writable,
  json?: Buffer | null,
  ktpUpdate?: Readable,
  koeUpdate?: Readable,
  requiredServerVersion?: string
): Promise<void> {
  const bundleDir = path.dirname(require.resolve('@digabi/exam-engine-core/dist/main-bundle.js'))
  const renderingFiles = await glob(`${bundleDir}/{main-bundle.js,main.css,assets/*}`, {
    nodir: true,
    realpath: true
  })

  const zipFile = new yazl.ZipFile()
  const promise = pipeZipFile(zipFile, outputStream)
  const keyAndIv = deriveAES256KeyAndIv(passphrase)

  if (requiredServerVersion) {
    addSignedManifest(zipFile, answersPrivateKey, requiredServerVersion)
  }

  encryptAndSign(
    zipFile,
    json ? 'abitti-exam.xml' : 'exam.xml',
    keyAndIv,
    answersPrivateKey,
    toStream(Buffer.from(xml))
  )

  if (json) {
    encryptAndSign(zipFile, 'exam.json', keyAndIv, answersPrivateKey, toStream(json))
  }
  encryptAndSign(zipFile, 'nsa.zip', keyAndIv, answersPrivateKey, nsaScripts)
  if (securityCodes) {
    encryptAndSign(zipFile, 'security-codes.json', keyAndIv, answersPrivateKey, securityCodes)
  }
  if (ktpUpdate) {
    encryptAndSign(zipFile, 'ktp-update.zip', keyAndIv, answersPrivateKey, ktpUpdate)
  }
  if (koeUpdate) {
    const koeUpdateCloneable = cloneable(koeUpdate)
    encryptAndSign(zipFile, 'koe-update.zip', keyAndIv, answersPrivateKey, koeUpdateCloneable.clone())
    sign(zipFile, 'koe-update.zip', answersPrivateKey, koeUpdateCloneable)
  }
  encryptAndSignFiles(
    zipFile,
    'rendering.zip',
    keyAndIv,
    answersPrivateKey,
    renderingFiles.map(renderingFile => ({
      contents: fs.createReadStream(renderingFile),
      filename: path.relative(bundleDir, renderingFile)
    }))
  )
  encryptAndSignFiles(
    zipFile,
    'attachments.zip',
    keyAndIv,
    answersPrivateKey,
    attachments.map(({ filename, contents, restricted }) => ({
      filename: restricted ? path.join('restricted', filename) : filename,
      contents
    }))
  )

  zipFile.end()
  await promise
}

export async function createMultiMex(
  exams: ExamFile[],
  nsaScripts: Readable,
  securityCodes: Readable,
  passphrase: string,
  answersPrivateKey: string,
  outputStream: Writable,
  loadSimulationConfiguration?: Readable,
  ktpUpdate?: Readable,
  koeUpdate?: Readable,
  requiredServerVersion?: string
): Promise<void> {
  const zipFile = new yazl.ZipFile()
  const promise = pipeZipFile(zipFile, outputStream)
  const keyAndIv = deriveAES256KeyAndIv(passphrase)

  if (requiredServerVersion) {
    addSignedManifest(zipFile, answersPrivateKey, requiredServerVersion)
  }

  for (const exam of exams) {
    addReadStream(zipFile, exam.contents, exam.filename)
  }

  encryptAndSign(zipFile, 'nsa.zip', keyAndIv, answersPrivateKey, nsaScripts)
  encryptAndSign(zipFile, 'security-codes.json', keyAndIv, answersPrivateKey, securityCodes)
  if (loadSimulationConfiguration) {
    encryptAndSign(
      zipFile,
      'load-simulation-configuration.json',
      keyAndIv,
      answersPrivateKey,
      loadSimulationConfiguration
    )
  }
  if (ktpUpdate) {
    encryptAndSign(zipFile, 'ktp-update.zip', keyAndIv, answersPrivateKey, ktpUpdate)
  }
  if (koeUpdate) {
    const koeUpdateCloneable = cloneable(koeUpdate)
    encryptAndSign(zipFile, 'koe-update.zip', keyAndIv, answersPrivateKey, koeUpdateCloneable.clone())
    sign(zipFile, 'koe-update.zip', answersPrivateKey, koeUpdateCloneable)
  }

  zipFile.end()
  await promise
}

function encryptAndSignFiles(
  zipFile: ZipFile,
  filename: string,
  keyAndIv: KeyAndIv,
  answersPrivateKey: string,
  files: ExamFile[]
) {
  const innerZipFile = new yazl.ZipFile()
  innerZipFile.on('error', error => zipFile.emit('error', error))
  for (const file of files) {
    addReadStream(innerZipFile, file.contents, file.filename)
  }
  innerZipFile.end()

  encryptAndSign(zipFile, filename, keyAndIv, answersPrivateKey, innerZipFile.outputStream as Readable)
}

function encryptAndSign(
  zipFile: ZipFile,
  filename: string,
  keyAndIv: KeyAndIv,
  answersPrivateKey: string,
  input: Readable
): void {
  input.once('error', error => zipFile.emit('error', error))
  const encrypted = cloneable(input.pipe(createAES256EncryptStreamWithIv(keyAndIv)))

  addReadStream(zipFile, encrypted.clone(), `${filename}.bin`)
  sign(zipFile, `${filename}.bin`, answersPrivateKey, encrypted)
}

function sign(zipFile: ZipFile, filename: string, answersPrivateKey: string, input: Readable): void {
  const signer = signWithSHA256AndRSA(input, answersPrivateKey)
  addReadStream(zipFile, signer, `${filename}.sig`)
}

/**
 * Adds the required-server-version manifest as a top-level, unencrypted but signed
 * file (`required-server-version.json` + `required-server-version.json.sig`).
 */
function addSignedManifest(zipFile: ZipFile, answersPrivateKey: string, requiredServerVersion: string): void {
  const manifest = Buffer.from(JSON.stringify({ requiredServerVersion }))
  const input = cloneable(toStream(manifest))
  addReadStream(zipFile, input.clone(), REQUIRED_SERVER_VERSION_FILENAME)
  sign(zipFile, REQUIRED_SERVER_VERSION_FILENAME, answersPrivateKey, input)
}

function pipeZipFile(zipFile: ZipFile, outputStream: Writable): Promise<void> {
  zipFile.on('error', (error: Error) => outputStream.destroy(error))
  return pipeline(zipFile.outputStream, outputStream)
}

function addReadStream(zipFile: ZipFile, input: Readable, filename: string): void {
  input.once('error', error => zipFile.emit('error', error))
  zipFile.addReadStream(input, filename)
}

function toStream(buffer: Buffer): Readable {
  const readable = new Readable()
  readable.push(buffer)
  readable.push(null)
  return readable
}
