import * as fs from 'fs/promises'
import { exec, stripColorCodes } from './util'
import path from 'path'

describe('ee new', () => {
  const cwd = path.resolve(__dirname, '../../..')
  let output: string

  beforeAll(removeDirectory)
  beforeAll(async () => {
    output = await exec('yarn ee new new_exam', { cwd })
  })
  afterAll(removeDirectory)

  it('logs exam creation', () => {
    expect(stripColorCodes(output)).toContain(`✔ new_exam`)
  })

  it('creates new exam skeleton', async () => {
    const list = await fs.readdir(path.resolve(cwd, 'new_exam'))
    const newExam = await fs.readFile(path.resolve(cwd, 'new_exam', 'exam.xml'), { encoding: 'utf8' })
    expect(list).toEqual(['attachments', 'exam.xml'])
    expect(newExam).toMatchSnapshot()
  })

  function removeDirectory() {
    return fs.rm(path.resolve(cwd, 'new_exam'), { recursive: true, force: true })
  }
})
