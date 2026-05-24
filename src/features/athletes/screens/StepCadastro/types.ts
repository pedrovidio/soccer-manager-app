import type { useEditProfileForm } from '@features/athletes/hooks/useEditProfileForm';

export type StepCadastroProps = Pick<
  ReturnType<typeof useEditProfileForm>,
  | 'name' | 'setName' | 'cpf' | 'setCpf' | 'gender' | 'setGender'
  | 'phone' | 'setPhone' | 'age' | 'setAge'
  | 'position' | 'setPosition' | 'pixKey' | 'setPixKey'
  | 'photoUri' | 'setPhotoUri'
  | 'cep' | 'setCep' | 'cepLoading' | 'street' | 'setStreet' | 'addrNum' | 'setAddrNum'
  | 'complement' | 'setComplement' | 'neighborhood' | 'setNeighborhood'
  | 'city' | 'setCity' | 'addrState' | 'setAddrState'
  | 'athleteId' | 'dashboard'
>;
