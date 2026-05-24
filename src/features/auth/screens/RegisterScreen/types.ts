import { RegisterFormData } from '../../registerTypes';

export type RegisterFieldSetter = (
  field: keyof RegisterFormData,
  value: RegisterFormData[keyof RegisterFormData],
) => void;

export type RegisterStepProps = {
  form: RegisterFormData;
  setField: RegisterFieldSetter;
};
