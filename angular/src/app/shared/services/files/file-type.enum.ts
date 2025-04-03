import { mapEnumToOptions } from '@abp/ng.core';

export enum FileType {
  Directory = 1,
  RegularFile = 2,
}
export enum GoogleDriveMimeType {
  TaiLieu = 1,
  BangTinh = 2,
  BanTrinhBay = 3,
  PDF = 4,
  HinhAnh = 5,
  Video = 6,
  FileNen = 7,
}
export enum TypeUploadFile {
  GoogleDrive = 1,
  DropBox = 2,
  OneDrive = 3,
}

export const fileTypeOptions = mapEnumToOptions(FileType);
