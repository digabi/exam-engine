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
 * minimum KTP server version the package requires. It is intentionally left
 * unencrypted so the server can read & signature-verify it before the decrypt
 * passphrase is entered (signature verification is asymmetric and needs no
 * passphrase). The matching detached signature is `${MIN_SERVER_VERSION_FILENAME}.sig`.
 */
export const MIN_SERVER_VERSION_FILENAME = 'min-server-version.json'

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
  minServerVersion?: string
): Promise<void> {
  const bundleDir = path.dirname(require.resolve('@digabi/exam-engine-core/dist/main-bundle.js'))
  const renderingFiles = await glob(`${bundleDir}/{main-bundle.js,main.css,assets/*}`, {
    nodir: true,
    realpath: true
  })

  const zipFile = new yazl.ZipFile()
  const keyAndIv = deriveAES256KeyAndIv(passphrase)

  if (minServerVersion) {
    addSignedManifest(zipFile, answersPrivateKey, minServerVersion)
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

  const promise = pipeline(zipFile.outputStream, outputStream)
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
  minServerVersion?: string
): Promise<void> {
  const zipFile = new yazl.ZipFile()
  const keyAndIv = deriveAES256KeyAndIv(passphrase)

  if (minServerVersion) {
    addSignedManifest(zipFile, answersPrivateKey, minServerVersion)
  }

  for (const exam of exams) {
    zipFile.addReadStream(exam.contents, exam.filename)
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

  const promise = pipeline(zipFile.outputStream, outputStream)
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
  for (const file of files) {
    innerZipFile.addReadStream(file.contents, file.filename)
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
  const encrypted = cloneable(input.pipe(createAES256EncryptStreamWithIv(keyAndIv)))

  zipFile.addReadStream(encrypted.clone(), `${filename}.bin`)
  sign(zipFile, `${filename}.bin`, answersPrivateKey, encrypted)
}

function sign(zipFile: ZipFile, filename: string, answersPrivateKey: string, input: Readable): void {
  const signer = signWithSHA256AndRSA(input, answersPrivateKey)
  zipFile.addReadStream(signer, `${filename}.sig`)
}

/**
 * Adds the minimum-server-version manifest as a top-level, unencrypted but signed
 * file (`min-server-version.json` + `min-server-version.json.sig`). Unlike everything
 * else in the package it is deliberately not encrypted, so the server can read and
 * verify it before the decrypt passphrase is entered. The signature is over the exact
 * plaintext bytes written into the zip.
 */
function addSignedManifest(zipFile: ZipFile, answersPrivateKey: string, minServerVersion: string): void {
  const manifest = Buffer.from(JSON.stringify({ minServerVersion }))
  const input = cloneable(toStream(manifest))
  zipFile.addReadStream(input.clone(), MIN_SERVER_VERSION_FILENAME)
  sign(zipFile, MIN_SERVER_VERSION_FILENAME, answersPrivateKey, input)
}

function toStream(buffer: Buffer): Readable {
  const readable = new Readable()
  readable.push(buffer)
  readable.push(null)
  return readable
}
