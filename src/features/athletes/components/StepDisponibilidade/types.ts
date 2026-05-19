import type { useEditProfileForm } from '../../hooks/useEditProfileForm';

export type StepDisponibilidadeProps = Pick<
  ReturnType<typeof useEditProfileForm>,
  | 'wantsAvailability' | 'setWantsAvailability'
  | 'slots' | 'setSlots'
>;
