import fs from 'fs'
import glob from 'glob-promise'
import path from 'path'
import { Readable } from 'stream'
import yazl, { ZipFile } from 'yazl'
import { createAES256EncryptStreamWithIv, deriveAES256KeyAndIv, KeyAndIv, signWithSHA256AndRSA } from './crypto-utils'
import cloneable from 'cloneable-readable'

export interface ExamFile {
  /** A relative filename (e.g. "foo.mp3"). This should be the same filename than in the exam XML. */
  filename: string
  /** A ReadableStream of the file contents */
  contents: NodeJS.ReadableStream
}

export interface AttachmentFile extends ExamFile {
  /** Whether this attachment is restricted or not. */
  restricted: boolean
}

export async function createMex(
  xml: string,
  attachments: AttachmentFile[],
  nsaScripts: NodeJS.ReadableStream,
  securityCodes: NodeJS.ReadableStream | null,
  passphrase: string,
  answersPrivateKey: string,
  outputStream: NodeJS.WritableStream,
  json?: Buffer | null,
  ktpUpdate?: NodeJS.ReadableStream,
  koeUpdate?: NodeJS.ReadableStream
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
    const koeUpdateCloneable = cloneable(koeUpdate as Readable)
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

  zipFile.outputStream.pipe(outputStream)
  zipFile.end()

  return streamToPromise(outputStream)
}

export async function createMultiMex(
  exams: ExamFile[],
  nsaScripts: NodeJS.ReadableStream,
  securityCodes: NodeJS.ReadableStream,
  passphrase: string,
  answersPrivateKey: string,
  outputStream: NodeJS.WritableStream,
  loadSimulationConfiguration?: NodeJS.ReadableStream,
  ktpUpdate?: NodeJS.ReadableStream,
  koeUpdate?: NodeJS.ReadableStream
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
    const koeUpdateCloneable = cloneable(koeUpdate as Readable)
    encryptAndSign(zipFile, 'koe-update.zip', keyAndIv, answersPrivateKey, koeUpdateCloneable.clone())
    sign(zipFile, 'koe-update.zip', answersPrivateKey, koeUpdateCloneable)
  }

  zipFile.outputStream.pipe(outputStream)
  zipFile.end()

  return streamToPromise(outputStream)
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

  encryptAndSign(zipFile, filename, keyAndIv, answersPrivateKey, innerZipFile.outputStream)
}

function encryptAndSign(
  zipFile: ZipFile,
  filename: string,
  keyAndIv: KeyAndIv,
  answersPrivateKey: string,
  input: NodeJS.ReadableStream
): void {
  const cloneableInput = cloneable(input as Readable)
  const encrypted = cloneableInput.clone().pipe(createAES256EncryptStreamWithIv(keyAndIv))

  zipFile.addReadStream(encrypted, `${filename}.bin`)
  sign(zipFile, `${filename}.bin`, answersPrivateKey, cloneableInput)
}

function sign(zipFile: ZipFile, filename: string, answersPrivateKey: string, input: NodeJS.ReadableStream): void {
  const signer = signWithSHA256AndRSA(input, answersPrivateKey)
  zipFile.addReadStream(signer, `${filename}.sig`)
}

function toStream(buffer: Buffer): Readable {
  const readable = new Readable()
  readable.push(buffer)
  readable.push(null)
  return readable
}

function streamToPromise(stream: NodeJS.WritableStream): Promise<void> {
  return new Promise((resolve, reject) => {
    stream.on('finish', resolve)
    stream.on('error', reject)
  })
}
