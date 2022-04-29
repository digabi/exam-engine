import * as childPromise from 'child_process'
import { promisify } from 'util'
import yauzl from 'yauzl-promise'
import * as Stream from 'stream'
import * as fs from 'fs/promises'

const execAsync = promisify(childPromise.exec)

describe('cli', () => {
  it('prints help', async () => {
    const output = await exec('yarn ee')
    expect(output).toContain(`Usage: index.js <command> [options]

Commands:
  index.js new <directory>                       Create a new exam
  index.js preview [exam] [options]              Preview an exam  [aliases: start]
  index.js create-transfer-zip [exam] [options]  Create a transfer zip that can be imported to Oma Abitti
  index.js create-offline [exam] [options]       Create a standalone offline version of the exam.
  index.js create-mex [exam] [options]           Package the exam to a .mex file that can be imported by Abitti
  index.js migrate [exam]                        Convert an exam to the latest schema.

Options:
  --help     Show help  [boolean]
  --version  Show version number  [boolean]`)
  })
  it('creates new exam skeleton', async () => {
    await fs.rm('new_exam', { recursive: true, force: true })
    const output = await exec('yarn ee new new_exam')
    const list = await fs.readdir('new_exam')
    const newExam = await fs.readFile('new_exam/exam.xml', { encoding: 'utf8' })
    expect(list).toEqual(['attachments', 'exam.xml'])
    expect(newExam).toMatchSnapshot()
    expect(stripColorCodes(output)).toContain(`✔ new_exam`)
  })
  it('creates transfer.zip', async () => {
    const output = await exec('yarn ee create-transfer-zip packages/exams/SC/SC.xml')
    const dir = process.cwd()
    expect(stripColorCodes(output)).toContain(`- Creating a transfer zips for ${dir}/packages/exams/SC/SC.xml...
✔ ${dir}/packages/exams/SC/SC_fi-FI_transfer.zip
✔ ${dir}/packages/exams/SC/SC_sv-FI_transfer.zip
✔ ${dir}/packages/exams/SC/SC_fi-FI_hi_transfer.zip`)

    const zipFile = await yauzl.open(`${dir}/packages/exams/SC/SC_fi-FI_transfer.zip`, { lazyEntries: true })
    const entries: string[] = []
    let examXml = ''
    const attachmentNames: string[] = []
    await zipFile.walkEntries(async (entry) => {
      entries.push(entry.fileName)
      if (entry.fileName === 'exam.xml') {
        const examContentReadStream = await entry.openReadStream()
        examXml = await readStreamToString(examContentReadStream)
      }
      if (entry.fileName === 'attachments.zip') {
        const attachments = await yauzl.fromBuffer(await streamToBuffer(await entry.openReadStream()))
        await attachments.walkEntries((attachmentEntry) => {
          attachmentNames.push(attachmentEntry.fileName)
        })
      }
    })
    expect(entries).toEqual(['exam.xml', 'attachments.zip'])
    expect(attachmentNames).toMatchSnapshot()
    expect(examXml).toMatchSnapshot()
  })
  it('creates offline', async () => {
    const output = await exec('yarn ee create-offline packages/exams/SC/SC.xml')
    const dir = process.cwd()
    expect(output.replaceAll('[32m✔[39m', '✔')).toContain(`- Creating offline versions for ${dir}/packages/exams/SC/SC.xml...
✔ ${dir}/packages/exams/SC/1970-01-01_SC_fi
✔ ${dir}/packages/exams/SC/1970-01-01_SC_sv
✔ ${dir}/packages/exams/SC/1970-01-01_SC_fi_hi`)
    const index = await fs.readFile(`${dir}/packages/exams/SC/1970-01-01_SC_fi/index.html`, { encoding: 'utf8' })
    const gradingInstructions = await fs.readFile(
      `${dir}/packages/exams/SC/1970-01-01_SC_fi/grading-instructions.html`,
      { encoding: 'utf8' }
    )
    expect(index.replace(/(width: )(\d+)(px)/g, '$199$3')).toMatchSnapshot()
    expect(gradingInstructions.replace(/(width: )(\d+)(px)/g, '$199$3')).toMatchSnapshot()
    expect(await fs.readdir(`${dir}/packages/exams/SC/1970-01-01_SC_fi`)).toMatchSnapshot()
    expect(await fs.readdir(`${dir}/packages/exams/SC/1970-01-01_SC_fi/assets`)).toMatchSnapshot()
    expect(await fs.readdir(`${dir}/packages/exams/SC/1970-01-01_SC_fi/attachments`)).toMatchSnapshot()
  })
})

function readStreamToString(readStream: Stream): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let readBuilder = ''
    readStream.on('data', (data: string) => (readBuilder += data.toString()))
    readStream.on('error', ({ message }) => reject(new Error(String(message))))
    readStream.on('end', () => {
      resolve(readBuilder)
    })
  })
}
function streamToBuffer(readableStream: Stream): Promise<Buffer> {
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

const exec = async (cmd: string) => {
  try {
    const { stdout } = await execAsync(cmd)
    return stdout
  } catch ({ stderr, stdout }) {
    return String(stdout) + String(stderr)
  }
}

function stripColorCodes(output: string) {
  return output.replaceAll('[32m✔[39m', '✔')
}
