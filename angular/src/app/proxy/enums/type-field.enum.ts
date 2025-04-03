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
}

export const typeFieldOptions = mapEnumToOptions(TypeField);
