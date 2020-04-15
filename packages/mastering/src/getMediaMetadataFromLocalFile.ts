const ffprobe = require('ffprobe')
const ffprobeStatic = require('ffprobe-static')

interface ImageMetadata {
  width: number
  height: number
}
interface AudioMetadata {
  duration: number
}

/** Loads media metadata from files on the local file system. */
export const getMediaMetadataFromLocalFile = (resolveAttachment: (filename: string) => string) => async (
  src: string,
  type: 'video' | 'audio' | 'image'
): Promise<ImageMetadata | AudioMetadata> => {
  const parseWebmDuration = (s: any) => parseFloat(s.tags.DURATION.replace(/:/g, ''))
  const path = resolveAttachment(src)

  const result = await ffprobe(path, { path: ffprobeStatic.path })
  const stream = result.streams[0]

  if (type === 'video' || type === 'image') {
    const { width, height } = stream
    return { width, height }
  } else if (type === 'audio') {
    const duration = Math.round(stream.duration || parseWebmDuration(stream))
    return { duration }
  } else {
    throw new Error('Unknown media type: ' + type)
  }
}
