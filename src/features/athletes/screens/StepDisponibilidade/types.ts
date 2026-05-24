import type { useEditProfileForm } from '@features/athletes/hooks/useEditProfileForm';

export type StepDisponibilidadeProps = Pick<
  ReturnType<typeof useEditProfileForm>,
  | 'wantsAvailability' | 'setWantsAvailability'
  | 'slots' | 'setSlots'
>;
