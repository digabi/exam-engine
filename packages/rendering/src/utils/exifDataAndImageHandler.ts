import path from 'path'
import { rm, writeFile, readFile } from 'fs/promises'
import * as exif from 'piexif-ts'

export async function createFileWithCleanExif(sourceFilePath: string): Promise<string> {
  const imageData = async function (src: string) {
    const data = await readFile(src)
    return data.toString('binary')
  }

  if (path.extname(sourceFilePath) === '.jpg') {
    const newFileSource: string = sourceFilePath
    const data = exif.load(await imageData(sourceFilePath))
    const cleanExifData: exif.IExif = createCleanExif(data)
    const newImageBinary = exif.insert(exif.dump(cleanExifData), exif.remove(await imageData(sourceFilePath)))
    await rm(sourceFilePath, { force: true })
    await writeFile(newFileSource, newImageBinary, { encoding: 'binary' })
  }
  return sourceFilePath
}

function createCleanExif(exifSource: exif.IExif): exif.IExif {
  return {
    ...exifSource,
    ...(exifSource?.['0th'] && { '0th': appendImageIFData(exifSource['0th']) }),
    ...(exifSource?.Exif && { Exif: appendExifIFData(exifSource.Exif) }),
    ...(exifSource?.GPS && { GPS: appendGPSIFData() })
  }
}

function appendGPSIFData() {
  return {}
}

function appendExifIFData(source: exif.IExif) {
  const exifIFD = exif.TagValues.ExifIFD
  return Object.assign(source, {
    [exifIFD.MakerNote]: '',
    [exifIFD.UserComment]: '',
    [exifIFD.LensMake]: '',
    [exifIFD.LensModel]: '',
    [exifIFD.LensSerialNumber]: '',
    [exifIFD.LensSpecification]: [[0]],
    [exifIFD.CameraOwnerName]: '',
    [exifIFD.BodySerialNumber]: '',
    [exifIFD.DateTimeOriginal]: '',
    [exifIFD.DateTimeDigitized]: ''
  })
}

function appendImageIFData(source: exif.IExif) {
  const imageIFD = exif.TagValues.ImageIFD
  return Object.assign(source, {
    [imageIFD.DocumentName]: '',
    [imageIFD.ImageDescription]: '',
    [imageIFD.Make]: '',
    [imageIFD.Model]: '',
    [imageIFD.Model]: '',
    [imageIFD.Software]: '',
    [imageIFD.DateTime]: '',
    [imageIFD.Artist]: '',
    [imageIFD.HostComputer]: '',
    [imageIFD.Copyright]: '',
    [imageIFD.ExposureTime]: [[0]],
    [imageIFD.TimeZoneOffset]: [0],
    [imageIFD.XPKeywords]: [0],
    [imageIFD.XPTitle]: [0],
    [imageIFD.XPComment]: [0],
    [imageIFD.XPSubject]: [0],
    [imageIFD.LocalizedCameraModel]: [0],
    [imageIFD.CameraSerialNumber]: '',
    [imageIFD.MakerNoteSafety]: [0],
    [imageIFD.OriginalRawFileName]: [0],
    [imageIFD.OriginalRawFileData]: ''
  })
}
