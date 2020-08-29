#!/usr/bin/env node

import { accessSync } from 'fs'
import ora = require('ora')
import yargs from 'yargs'
import { resolveExam, resolveFile } from './utils'

/* eslint-disable @typescript-eslint/no-misused-promises */
yargs
  .usage('Usage: $0 <command> [options]')
  .command(
    'new <directory>',
    'Create a new exam',
    (argv) => {
      argv
        .positional('directory', {
          description: 'The directory for the new exam',
          type: 'string',
        })
        .demandOption('directory')
    },
    runCommand('./commands/new')
  )
  .command(
    ['preview [exam] [options]', 'start'],
    'Preview an exam',
    (argv) => {
      addExamArgs(argv)
      argv.option('port', {
        alias: 'p',
        description: 'The port to use in the preview HTTP server',
        type: 'number',
        default: 0,
      })
    },
    runCommand('./commands/preview')
  )
  .command(
    'create-transfer-zip [exam] [options]',
    'Create a transfer zip that can be imported to Oma Abitti',
    addExamArgs,
    runCommand('./commands/create-transfer-zip')
  )
  .command(
    'create-offline [exam] [options]',
    'Create a standalone offline version of the exam.',
    (argv) => {
      addExamAndOutdirArgs(argv)
      argv.option('media', {
        description:
          'Create a media version of the exam. This will encode video files as x264 and audio files as mp3 and not remove hidden references from the exam.',
        type: 'boolean',
      })
    },
    runCommand('./commands/create-offline')
  )
  .command(
    'create-mex [exam] [options]',
    'Package the exam to a .mex file that can be imported by Abitti',
    (argv) => {
      addExamAndOutdirArgs(argv)
      argv
        .option('private-key', {
          alias: 'k',
          description: 'The private key (in PEM format) used for signing the exam',
          coerce: resolveFile,
        })
        .option('passphrase', {
          alias: 'p',
          description: 'The secret passphrase that decrypts the exam',
        })
        .option('nsa-scripts', {
          alias: 'n',
          description: 'Monitoring scripts as a .zip file',
          coerce: resolveFile,
        })
        .option('security-codes', {
          alias: 's',
          description: 'The security codes (in JSON format)',
          coerce: resolveFile,
        })
        .demandOption(['private-key', 'passphrase', 'nsa-scripts'])
    },
    runCommand('./commands/create-mex')
  )
  .check((argv: { exam?: string }) => {
    if (argv.exam) {
      accessSync(argv.exam)
    }
    return true
  })
  .demandCommand()
  .strict()
  .wrap(yargs.terminalWidth()).argv

/* eslint-enable @typescript-eslint/no-misused-promises */

function addExamArgs(yargv: yargs.Argv) {
  yargv.positional('exam', {
    description: 'The path to an exam XML file or the directory containing it.',
    default: process.cwd(),
    coerce: resolveExam,
  })
}

function addExamAndOutdirArgs(argv: yargs.Argv) {
  addExamArgs(argv)
  argv.option('outdir', {
    alias: 'o',
    description: 'The output directory',
    type: 'string',
    coerce: resolveFile,
  })
}

function runCommand<T>(moduleName: string) {
  return async (args: T) => {
    const spinner = ora().start()
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      const command = require(moduleName).default
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
      const result = await command({ ...args, spinner })
      if (result) {
        spinner.succeed(result)
      }
    } catch (err) {
      spinner.fail((err as Error).stack)
      process.exit(1)
    } finally {
      spinner.stop()
    }
  }
}
