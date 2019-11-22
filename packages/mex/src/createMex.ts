import fs from 'fs'
import * as glob from 'glob'
import path from 'path'
import { PassThrough, Readable } from 'stream'
import yazl, { ZipFile } from 'yazl'
import { createAES256EncryptStreamWithIv, deriveAES256KeyAndIv, KeyAndIv, signWithSHA256AndRSA } from './crypto-utils'

const bundleDir = path.dirname(require.resolve('@digabi/exam-engine/dist/main-bundle.js'))
const renderingFiles = glob
  .sync(bundleDir + '/**/*', {
    nodir: true,
    realpath: true
  })
  .filter(file => !file.endsWith('.d.ts'))

interface ExamFile {
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
  json?: Buffer | null
) {
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
  outputStream: NodeJS.WritableStream
) {
  const zipFile = new yazl.ZipFile()
  const keyAndIv = deriveAES256KeyAndIv(passphrase)

  for (const exam of exams) {
    zipFile.addReadStream(exam.contents, exam.filename)
  }

  encryptAndSign(zipFile, 'nsa.zip', keyAndIv, answersPrivateKey, nsaScripts)
  encryptAndSign(zipFile, 'security-codes.json', keyAndIv, answersPrivateKey, securityCodes)

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
  const encrypted = input.pipe(createAES256EncryptStreamWithIv(keyAndIv))
  const encryptedPassthrough = new PassThrough()
  encrypted.pipe(encryptedPassthrough)

  const signer = signWithSHA256AndRSA(encrypted, answersPrivateKey)

  zipFile.addReadStream(encryptedPassthrough, `${filename}.bin`)
  zipFile.addReadStream(signer, `${filename}.bin.sig`)
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
