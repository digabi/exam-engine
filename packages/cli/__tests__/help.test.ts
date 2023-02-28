import { exec } from './util'
import path from 'path'

describe('ee', () => {
  const root = path.resolve(__dirname, '../../..')
  let output: string

  beforeAll(async () => {
    output = await exec('yarn ee', { cwd: root })
  })

  it('prints help', () => {
    expect(output.replaceAll('index.js', 'ee')).toContain(`Usage: ee <command> [options]

Commands:
  ee new <directory>                               Create a new exam
  ee preview [exam] [options]                      Preview an exam  [aliases: start]
  ee create-transfer-zip [exam] [options]          Create a transfer zip that can be imported to Oma Abitti
  ee create-offline [exam] [options]               Create a standalone offline version of the exam.
  ee create-grading-instructions [exam] [options]  Create a grading instructions of the exam.
  ee create-mex [exam] [options]                   Package the exam to a .mex file that can be imported by Abitti
  ee migrate [exam]                                Convert an exam to the latest schema.

Options:
  --help     Show help  [boolean]
  --version  Show version number  [boolean]`)
  })
})
