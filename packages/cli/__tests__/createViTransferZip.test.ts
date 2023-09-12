import { exec, extractTransferZip, stripColorCodes } from './util'
import path from 'path'

describe('ee create-transfer-zip', () => {
  const root = path.resolve(__dirname, '../../..')
  let output: string

  beforeAll(async () => {
    output = await exec('npm run ee create-transfer-zip packages/exams/N/N.xml', { cwd: root })
  })

  it('logs progress', () => {
    expect(stripColorCodes(output)).toContain(`- Creating a transfer zips for ${root}/packages/exams/N/N.xml...
✔ ${root}/packages/exams/N/N_fi-FI_transfer.zip
✔ ${root}/packages/exams/N/N_sv-FI_transfer.zip
✔ ${root}/packages/exams/N/N_fi-FI_vi_transfer.zip`)
  })

  it('creates normal transfer zip', async () => {
    const { attachmentNames, entries, examXml } = await extractTransferZip(
      `${root}/packages/exams/N/N_fi-FI_transfer.zip`
    )
    expect(entries).toEqual(['exam.xml', 'attachments.zip'])
    expect(attachmentNames).toMatchSnapshot()
    expect(examXml).toMatchSnapshot()
  })

  it('creates vi transfer zip', async () => {
    const { attachmentNames, entries, examXml } = await extractTransferZip(
      `${root}/packages/exams/N/N_fi-FI_vi_transfer.zip`
    )
    expect(entries).toEqual(['exam.xml', 'attachments.zip'])
    expect(attachmentNames).toMatchSnapshot()
    expect(examXml).toMatchSnapshot()
  })
})
