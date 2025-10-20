import crypto from 'crypto'
import { Readable } from 'stream'

const symmetricAlgo = 'aes-256-ctr'
const signAlgo = 'RSA-SHA256'
const defaultDigest = 'SHA1'

export interface KeyAndIv {
  key: Buffer
  iv: Buffer
}

export function createAES256EncryptStreamWithIv({ key, iv }: KeyAndIv): crypto.Cipheriv {
  return crypto.createCipheriv(symmetricAlgo, asBuffer(key), asBuffer(iv))
}

export function signWithSHA256AndRSA(input: NodeJS.ReadableStream, privateKeyPem: string): Readable {
  const signer = crypto.createSign(signAlgo)
  const signerStream = input.pipe(signer)
  const output = new Readable()

  signerStream.on('finish', () => {
    output.push(signer.sign(privateKeyPem, 'base64'))
    output.push(null)
  })
  signerStream.on('error', error => output.destroy(error))

  return output
}

export function verifyWithSHA256AndRSA(signedDataBuffer: Buffer, publicKey: string, signature: string): boolean {
  const verifier = crypto.createVerify(signAlgo)
  verifier.update(signedDataBuffer)
  return verifier.verify(publicKey, signature, 'base64')
}

export function deriveAES256KeyAndIv(password: string): KeyAndIv {
  const trimmedPassword = password.replace(/\s/g, '')
  const derivedData = crypto.pbkdf2Sync(trimmedPassword, trimmedPassword, 2000, 32 + 16, defaultDigest) // Use password as salt as well, 32 bytes for key, 16 for iv
  const key = derivedData.slice(0, 32)
  const iv = derivedData.slice(32, 48)
  return { key, iv }
}

function asBuffer(val: string | Buffer): Buffer {
  return Buffer.isBuffer(val) ? val : Buffer.from(val, 'base64')
}
