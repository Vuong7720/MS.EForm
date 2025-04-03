import { mapEnumToOptions } from '@abp/ng.core';

export enum FileExtention {
  Image = 1,
  File = 2,
  Document = 3,
  ImageThumb = 4,
  Video = 5,
}
export const fileExtentionOptions = mapEnumToOptions(FileExtention);

export enum FileExtentionSvg {
  css = 'assets/svg/css.svg',
  csv = 'assets/svg/csv.svg',
  json = 'assets/svg/json.svg',
  tiff = 'assets/svg/tiff.svg',
  tif = 'assets/svg/tiff.svg',
  txt = 'assets/svg/txt.svg',
  avi = 'assets/svg/avi.svg',
  mov = 'assets/svg/video.svg',
  mp4 = 'assets/svg/mp4.svg',
  webm = 'assets/svg/video.svg',
  mpeg = 'assets/svg/mpeg.svg',
  mp3 = 'assets/svg/mp3.svg',
  rar = 'assets/svg/rar.svg',
  zip = 'assets/svg/zip.svg',
  gz = 'assets/svg/zip.svg',
  iso = 'assets/svg/iso.svg',
  dmg = 'assets/svg/dmg.svg',
  doc = 'assets/svg/word.svg',
  docx = 'assets/svg/word.svg',
  ppt = 'assets/svg/ppt.svg',
  pptx = 'assets/svg/ppt.svg',
  xls = 'assets/svg/xls.svg',
  xlsx = 'assets/svg/xls.svg',
  pdf = 'assets/svg/pdf.svg',
  img = 'assets/svg/image.svg',
}

export const FileExtentionSvgOptions = mapEnumToOptions(FileExtentionSvg);
