import { promises as fs } from 'fs'
import path from 'path'

export function resolveFixture(filename: string): string {
  return path.resolve(__dirname, filename)
}

export async function readFixture(filename: string): Promise<string> {
  return fs.readFile(resolveFixture(filename), 'utf-8')
}
