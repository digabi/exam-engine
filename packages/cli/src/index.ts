#!/usr/bin/env node

import { accessSync } from 'fs'
import ora from 'ora'
import yargs from 'yargs'
import { resolveExam, resolveFile } from './utils'

// tslint:disable-next-line:no-unused-expression
yargs
  .usage('Usage: $0 <command> [options]')
  .command(
    'new <directory>',
    'Create a new exam',
    argv => {
      argv
        .positional('directory', {
          description: 'The directory for the new exam',
          type: 'string'
        })
        .demandOption('directory')
    },
    runCommand('./commands/new')
  )
  .command(['preview [exam]', 'start'], 'Preview an exam', addExamArgs, runCommand('./commands/preview'))
  .command(
    'create-transfer-zip [exam] [options]',
    'Create a transfer zip that can be imported to Oma Abitti',
    addExamArgs,
    runCommand('./commands/create-transfer-zip')
  )
  .command(
    'create-offline [exam] [options]',
    'Create a standalone offline version of the exam.',
    argv => {
      addExamAndOutdirArgs(argv)
      argv.option('media', {
        description:
          'Create a media version of the exam. This will encode video files as x264 and audio files as mp3 and not remove hidden references from the exam.',
        type: 'boolean'
      })
    },
    runCommand('./commands/create-offline')
  )
  .command(
    'create-mex [exam] [options]',
    'Package the exam to a .mex file that can be imported by Abitti',
    argv => {
      addExamAndOutdirArgs(argv)
      argv
        .option('private-key', {
          alias: 'k',
          description: 'The private key (in PEM format) used for signing the exam',
          coerce: resolveFile
        })
        .option('passphrase', {
          alias: 'p',
          description: 'The secret passphrase that decrypts the exam'
        })
        .option('nsa-scripts', {
          alias: 'n',
          description: 'Monitoring scripts as a .zip file',
          coerce: resolveFile
        })
        .option('security-codes', {
          alias: 's',
          description: 'The security codes (in JSON format)',
          coerce: resolveFile
        })
        .demandOption(['private-key', 'passphrase', 'nsa-scripts'])
    },
    runCommand('./commands/create-mex')
  )
  .check((argv: any) => {
    if (argv.exam) {
      accessSync(argv.exam)
    }
    return true
  })
  .demandCommand()
  .strict()
  .wrap(yargs.terminalWidth()).argv

function addExamArgs(yargv: yargs.Argv) {
  yargv.positional('exam', {
    description: 'The path to an exam XML file or the directory containing it.',
    default: process.cwd(),
    coerce: resolveExam
  })
}

function addExamAndOutdirArgs(argv: yargs.Argv) {
  addExamArgs(argv)
  argv.option('outdir', {
    alias: 'o',
    description: 'The output directory',
    type: 'string',
    coerce: resolveFile
  })
}

function runCommand<T>(moduleName: string) {
  return async (args: T) => {
    const spinner = ora().start()
    try {
      const command = require(moduleName).default
      const result = await command({ ...args, spinner })
      if (result) {
        spinner.succeed(result)
      }
    } catch (err) {
      spinner.fail(err.stack)
      process.exit(1)
    } finally {
      spinner.stop()
    }
  }
}
