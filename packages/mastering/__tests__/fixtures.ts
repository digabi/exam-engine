import { promises as fs } from 'fs'
import path from 'path'

export async function readFixture(filename: string): Promise<string> {
  return fs.readFile(path.resolve(__dirname, 'fixtures', filename), 'utf-8')
}
