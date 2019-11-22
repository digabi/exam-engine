import { promises as fs } from 'fs'
import * as libxmljs from 'libxmljs2'
import * as path from 'path'

export function resolveFixture(filename: string): string {
  return path.resolve(__dirname, '..', filename)
}

export async function readFixture(filename: string): Promise<string> {
  const buffer = await fs.readFile(resolveFixture(filename))
  return buffer.toString()
}

export async function writeFixture(filename: string, content: string): Promise<void> {
  return await fs.writeFile(resolveFixture(filename), content)
}
