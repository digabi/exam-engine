#!/usr/bin/env node

import { promises as fs } from 'fs'
import path from 'path'
import yargs from 'yargs'

// tslint:disable-next-line: no-unused-expression
yargs
  .command(
    '$0 <directory>',
    'Creates a new exam.',
    yargsc =>
      yargsc
        .positional('directory', { description: 'The directory for the new exam', type: 'string' })
        .demandOption('directory'),
    async ({ directory }) => {
      const fullDir = path.resolve(process.cwd(), directory)
      const resolveExamFile = (...file: string[]) => path.resolve(fullDir, ...file)
      try {
        await assertDirectoryDoesNotExist(fullDir)
        try {
          await fs.mkdir(fullDir, { recursive: true })
          await fs.mkdir(resolveExamFile('attachments'))
          await fs.writeFile(resolveExamFile('exam.xml'), exam)
          await fs.writeFile(resolveExamFile('attachments', 'README.txt'), attachmentsReadme)
        } catch (err) {
          await fs.unlink(fullDir)
          throw err
        }
      } catch (err) {
        // tslint:disable-next-line: no-console
        console.error(err.message)
        process.exit(1)
      }
    }
  )
  .help().argv

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
    throw new Error(`${directory} exists.`)
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err
    }
  }
}
