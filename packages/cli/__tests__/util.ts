import * as childPromise from 'child_process'
import { promisify } from 'util'
import * as Stream from 'stream'
import { ObjectEncodingOptions } from 'node:fs'
import { ExecOptions } from 'child_process'

const execAsync = promisify(childPromise.exec)

export function readStreamToString(readStream: Stream): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let readBuilder = ''
    readStream.on('data', (data: string) => (readBuilder += data.toString()))
    readStream.on('error', ({ message }) => reject(new Error(String(message))))
    readStream.on('end', () => {
      resolve(readBuilder)
    })
  })
}
export function streamToBuffer(readableStream: Stream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = []
    readableStream.on('data', (data: Uint8Array) => {
      chunks.push(data)
    })
    readableStream.on('error', ({ message }) => reject(new Error(String(message))))
    readableStream.on('end', function () {
      resolve(Buffer.concat(chunks))
    })
  })
}

export const exec = async (
  cmd: string,
  options: (ObjectEncodingOptions & ExecOptions) | undefined | null
): Promise<string> => {
  try {
    const { stdout } = await execAsync(cmd, options)
    return stdout as string
  } catch ({ stderr, stdout }) {
    return String(stdout) + String(stderr)
  }
}

export function stripColorCodes(output: string) {
  return output.replaceAll('[32m✔[39m', '✔')
}
