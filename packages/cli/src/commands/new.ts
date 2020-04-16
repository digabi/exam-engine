import { promises as fs } from 'fs'
import { Ora } from 'ora'
import path from 'path'

export default async function ({ directory }: { directory: string; spinner: Ora }) {
  const resolveExamFile = (...file: string[]) => path.resolve(directory, ...file)

  await assertDirectoryDoesNotExist(directory)

  try {
    await fs.mkdir(directory, { recursive: true })
    await fs.mkdir(resolveExamFile('attachments'))
    await fs.writeFile(resolveExamFile('exam.xml'), exam)
    await fs.writeFile(resolveExamFile('attachments', 'README.txt'), attachmentsReadme)
    return directory
  } catch (err) {
    await fs.unlink(directory)
    throw err
  }
}

const exam = `<?xml version="1.0" encoding="utf-8" ?>
<e:exam xmlns:e="http://ylioppilastutkinto.fi/exam.xsd" xmlns="http://www.w3.org/1999/xhtml" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://ylioppilastutkinto.fi/exam.xsd https://abitti.dev/schema/exam.xsd" exam-schema-version="0.1">
    <e:languages>
        <e:language>fi-FI</e:language>
    </e:languages>

    <e:exam-title>Exam title</e:exam-title>

    <e:exam-instruction>
        Exam instructions
    </e:exam-instruction>

    <e:table-of-contents />

    <e:section>
        <e:section-title>Section title</e:section-title>

        <e:question>
            <e:question-title>Question title</e:question-title>
            <e:question-instruction>Question instructions</e:question-instruction>
            <e:text-answer max-score="10" type="rich-text" />
        </e:question>
    </e:section>
</e:exam>
`
const attachmentsReadme = 'Place your attachments here and reference them from the exam XML.\n'

async function assertDirectoryDoesNotExist(directory: string) {
  try {
    await fs.access(directory)
    throw new Error(`${directory} already exists`)
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err
    }
  }
}
