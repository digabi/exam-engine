import { spawn } from 'child_process'
import fs from 'fs'
import _ from 'lodash'
import sharp from 'sharp'
import stream from 'stream'
import { promisify } from 'util'
import { AudioMetadata, GetMediaMetadata, ImageMetadata, VideoMetadata } from './mastering'

const pipeline = promisify(stream.pipeline)
const ffprobeStatic = require('ffprobe-static') // tslint:disable-line no-var-requires

/**
 * Loads media metadata from a `ReadableStream`. If `resolveAttachment` returns a string,
 * the file is loaded from the local file system with `fs.createReadStream`.
 */
export const mkGetMediaMetadata = (
  resolveAttachment: (filename: string) => NodeJS.ReadableStream | string
): GetMediaMetadata => async (src, type) => {
  const fileNameOrReadable = resolveAttachment(src)
  const input = _.isString(fileNameOrReadable) ? fs.createReadStream(fileNameOrReadable) : fileNameOrReadable

  switch (type) {
    case 'image':
      return getImageMetadata(src, input)
    case 'video':
      return getVideoMetadata(src, input)
    case 'audio':
      return getAudioMetadata(src, input)
  }
}

async function getImageMetadata(src: string, input: NodeJS.ReadableStream): Promise<ImageMetadata> {
  const sharpInstance = sharp()
  const metadataP = sharpInstance.metadata()
  await pipeline(input, sharpInstance)
  const metadata = await metadataP

  if (metadata.width != null && metadata.width > 0 && metadata.height != null && metadata.height > 0) {
    return { width: metadata.width, height: metadata.height }
  } else {
    throw new Error(`Unable to retrieve image metadata for ${src}`)
  }
}

async function getVideoMetadata(src: string, input: NodeJS.ReadableStream): Promise<VideoMetadata> {
  const metadata = await ffprobeMetadata(src, input)
  const videoStream = metadata.streams.find(s => s.height > 0 && s.width > 0)

  if (videoStream) {
    return { height: videoStream.height, width: videoStream.width }
  } else {
    throw new Error(`Unable to retrieve video metadata for ${src}`)
  }
}

async function getAudioMetadata(src: string, input: NodeJS.ReadableStream): Promise<AudioMetadata> {
  const metadata = await ffprobeMetadata(src, input)
  const lastpacket = _.last(metadata.packets) || {}
  const maybeDuration = Number(lastpacket.dts_time || lastpacket.pts_time) + Number(lastpacket.duration_time)

  if (maybeDuration > 0) {
    return { duration: Math.round(maybeDuration) }
  } else {
    throw new Error(`Unable to retrieve audio metadata for ${src}`)
  }
}

interface FFProbeOutput {
  streams: any[]
  packets: any[]
  format: any
}

async function ffprobeMetadata(src: string, input: NodeJS.ReadableStream): Promise<FFProbeOutput> {
  let stdout = ''

  return new Promise((resolve, reject) => {
    const ffprobe = spawn(
      ffprobeStatic.path,
      ['-v', 'quiet', '-print_format', 'json', '-show_streams', '-show_format', '-show_packets', '-i', 'pipe:0'],
      { windowsHide: true }
    )

    ffprobe.stdout.on('data', data => {
      stdout += data
    })

    ffprobe.once('exit', (code, signal) => {
      if (code) {
        return reject(new Error(`ffprobe exited with code ${code} while reading ${src}`))
      } else if (signal) {
        return reject(new Error(`ffprobe was killed with signal ${signal} while reading ${src}`))
      }

      try {
        const metadata: FFProbeOutput = JSON.parse(stdout)
        // TODO: Maybe a whitelist instead?
        const blacklistedFormats = ['jpeg_pipe', 'png_pipe', 'gif_pipe']

        if (blacklistedFormats.includes(metadata.format.format_name)) {
          reject(new Error(`Invalid audio or video format: ${metadata.format.format_name}`))
        } else {
          resolve(metadata)
        }
      } catch (err) {
        reject(new Error(`Unable to parse ffprobe output while reading ${src}\nstdout:${stdout}`))
      }
    })

    pipeline(input, ffprobe.stdin).catch(reject)
  })
}
