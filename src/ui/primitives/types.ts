import { ReactNode } from 'react';

export type SelectOption = {
  value: string | number;
  label: string;
};

export type WizardHeaderProps = {
  step: number;
  totalSteps: number;
  onBack: () => void;
};

export type FormFieldProps = {
  label: string;
  children: ReactNode;
};

export type ChipRowProps = {
  options: SelectOption[];
  selectedValue: string | number;
  onSelect: (value: any) => void;
};

export type LevelCardProps = {
  value: string;
  label: string;
  desc: string;
  icon: string;
  isSelected: boolean;
  onSelect: (value: any) => void;
};

export type SwitchRowProps = {
  label: string;
  desc: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export type SelectModalProps = {
  visible: boolean;
  title: string;
  options: string[];
  value: string;
  onClose: () => void;
  onSelect: (value: string) => void;
};

export type SimpleSelectProps = {
  value: string;
  onChange: (value: string) => void;
};
