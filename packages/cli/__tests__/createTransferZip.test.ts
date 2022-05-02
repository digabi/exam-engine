import yauzl from 'yauzl-promise'
import { exec, readStreamToString, streamToBuffer, stripColorCodes } from './util'
import path from 'path'

describe('ee create-transfer-zip', () => {
  const root = path.resolve(__dirname, '../../..')
  let output: string

  beforeAll(async () => {
    output = await exec('yarn ee create-transfer-zip packages/exams/SC/SC.xml', { cwd: root })
  })

  it('logs progress', () => {
    expect(stripColorCodes(output)).toContain(`- Creating a transfer zips for ${root}/packages/exams/SC/SC.xml...
✔ ${root}/packages/exams/SC/SC_fi-FI_transfer.zip
✔ ${root}/packages/exams/SC/SC_sv-FI_transfer.zip
✔ ${root}/packages/exams/SC/SC_fi-FI_hi_transfer.zip`)
  })

  it('creates transfer zip', async () => {
    const zipFile = await yauzl.open(`${root}/packages/exams/SC/SC_fi-FI_transfer.zip`, { lazyEntries: true })
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
})
