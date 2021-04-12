import fs from 'fs'
import glob from 'glob-promise'
import path from 'path'
import stream, { Readable, Writable } from 'stream'
import yazl, { ZipFile } from 'yazl'
import { createAES256EncryptStreamWithIv, deriveAES256KeyAndIv, KeyAndIv, signWithSHA256AndRSA } from './crypto-utils'
import cloneable from 'cloneable-readable'
import { promisify } from 'util'

const pipeline = promisify(stream.pipeline)

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
  koeUpdate?: Readable
): Promise<void> {
  const bundleDir = path.dirname(require.resolve('@digabi/exam-engine-core/dist/main-bundle.js'))
  const renderingFiles = await glob(bundleDir + '/{main-bundle.js,main.css,assets/*}', {
    nodir: true,
    realpath: true,
  })

  const zipFile = new yazl.ZipFile()
  const keyAndIv = deriveAES256KeyAndIv(passphrase)

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
    renderingFiles.map((renderingFile) => ({
      contents: fs.createReadStream(renderingFile),
      filename: path.relative(bundleDir, renderingFile),
    }))
  )
  encryptAndSignFiles(
    zipFile,
    'attachments.zip',
    keyAndIv,
    answersPrivateKey,
    attachments.map(({ filename, contents, restricted }) => ({
      filename: restricted ? path.join('restricted', filename) : filename,
      contents,
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
  koeUpdate?: Readable
): Promise<void> {
  const zipFile = new yazl.ZipFile()
  const keyAndIv = deriveAES256KeyAndIv(passphrase)

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

  encryptAndSign(zipFile, filename, keyAndIv, answersPrivateKey, new Readable().wrap(innerZipFile.outputStream))
}

function encryptAndSign(
  zipFile: ZipFile,
  filename: string,
  keyAndIv: KeyAndIv,
  answersPrivateKey: string,
  input: Readable
): void {
  const cloneableInput = cloneable(input)
  const encrypted = cloneableInput.clone().pipe(createAES256EncryptStreamWithIv(keyAndIv))

  zipFile.addReadStream(encrypted, `${filename}.bin`)
  sign(zipFile, `${filename}.bin`, answersPrivateKey, cloneableInput)
}

function sign(zipFile: ZipFile, filename: string, answersPrivateKey: string, input: Readable): void {
  const signer = signWithSHA256AndRSA(input, answersPrivateKey)
  zipFile.addReadStream(signer, `${filename}.sig`)
}

function toStream(buffer: Buffer): Readable {
  const readable = new Readable()
  readable.push(buffer)
  readable.push(null)
  return readable
}
