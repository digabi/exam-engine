import * as esbuild from 'esbuild'
import { lessLoader } from 'esbuild-plugin-less'
import _ from 'lodash'
import path from 'path'
import { CreateOfflineExamOptions } from './createOfflineExam'
import { RenderingOptions } from '.'
import examLoader from './exam-loader'

const sourceDirectory = __dirname
const publicDirectory = path.resolve(sourceDirectory, '../public')

export function getPreviewBuildOptions(
  examFilename: string,
  options: RenderingOptions,
  outdir: string
): esbuild.BuildOptions {
  return {
    ...getCommonBuildOptions(outdir),
    entryPoints: { main: path.resolve(sourceDirectory, 'preview.js') },
    define: {
      'process.env.npm_package_name': JSON.stringify(process.env.npm_package_name ?? ''),
      'process.env.EXAM_FILENAME': JSON.stringify(examFilename),
      'process.env.CAS_COUNTDOWN_DURATION_SECONDS': JSON.stringify(options.casCountdownDurationSeconds ?? null),
      'process.env.EDITABLE_GRADING_INSTRUCTIONS': JSON.stringify(Boolean(options.editableGradingInstructions))
    },
    plugins: [lessLoader(), examLoader(options.editableGradingInstructions)]
  }
}

export function getOfflineBuildOptions(
  result: { xml: string; language: string; title?: string | null },
  options: CreateOfflineExamOptions,
  outdir: string
): esbuild.BuildOptions {
  return {
    ...getCommonBuildOptions(outdir),
    entryPoints: { main: path.resolve(sourceDirectory, 'offline.js') },
    define: {
      'process.env.EXAM': JSON.stringify(result.xml),
      'process.env.EXAM_LANGUAGE': JSON.stringify(result.language),
      'process.env.EXAM_TITLE': JSON.stringify(result.title ?? ''),
      'process.env.MEDIA_VERSION': JSON.stringify(Boolean(options.mediaVersion))
    },
    plugins: [lessLoader()]
  }
}

function getCommonBuildOptions(outdir: string): esbuild.BuildOptions {
  return {
    absWorkingDir: path.resolve(sourceDirectory, '../../..'),
    bundle: true,
    minify: true,
    sourcemap: false,
    format: 'iife',
    outdir,
    entryNames: '[name]',
    assetNames: 'assets/[name]',
    loader: Object.fromEntries(
      ['.woff', '.woff2', '.otf', '.ttf', '.eot', '.svg', '.png', '.gif', '.jpg'].map(ext => [ext, 'file'])
    ),
    logLevel: 'warning'
  }
}

export { publicDirectory }
