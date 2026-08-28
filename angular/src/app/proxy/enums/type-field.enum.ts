import { mapEnumToOptions } from '@abp/ng.core';

export enum TypeField {
  Text = 1,
  AreaText = 2,
  Select = 3,
  CheckBox = 4,
  Radio = 5,
  DateTime = 6,
  Number = 7,
  Boolean = 8,
  File = 9,
  Signature = 10,
  Rating = 11,
  Group = 12,
}

export const typeFieldOptions = mapEnumToOptions(TypeField);
