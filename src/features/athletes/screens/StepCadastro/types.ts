import type { useEditProfileForm } from '@features/athletes/hooks/useEditProfileForm';

export type StepCadastroProps = Pick<
  ReturnType<typeof useEditProfileForm>,
  | 'name' | 'setName'
  | 'gender' | 'setGender'
  | 'birthDate' | 'setBirthDate'
  | 'position' | 'setPosition'
  | 'pixKey' | 'setPixKey'
  | 'photoUri' | 'setPhotoUri'
  | 'athleteId' | 'dashboard'
>;
