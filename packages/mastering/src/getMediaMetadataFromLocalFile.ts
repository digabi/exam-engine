import ffprobe from 'ffprobe'
import ffprobeStatic from 'ffprobe-static'

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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  const parseWebmDuration = (s: any) => parseFloat(s.tags.DURATION.replace(/:/g, ''))
  const path = resolveAttachment(src)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
  const result = await ffprobe(path, { path: ffprobeStatic.path })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
  const stream = result.streams[0]

  if (type === 'video' || type === 'image') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { width, height } = stream
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { width, height }
  } else if (type === 'audio') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const duration = Math.round(stream.duration || parseWebmDuration(stream))
    return { duration }
  } else {
    throw new Error(`Unknown media type: ${String(type)}`)
  }
}
