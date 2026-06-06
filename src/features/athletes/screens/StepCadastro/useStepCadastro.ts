import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getFullImageUrl } from '@lib/imageUrl';
import { queryKeys } from '@lib/queryKeys';
import { athleteApi } from '@features/athletes/services/athleteApi';
import { getInitials } from '@ui/utils/avatar';
import { StepCadastroProps } from './types';

export function useStepCadastro(props: StepCadastroProps) {
  const queryClient = useQueryClient();

  const photoMutation = useMutation({
    mutationFn: (uri: string) => athleteApi.uploadPhoto(props.athleteId, uri),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.home(props.athleteId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(props.athleteId) });
    },
    onError: () => Alert.alert('Erro', 'Nao foi possivel enviar a foto.'),
  });

  const pickPhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissao necessaria', 'Permita o acesso a galeria para trocar a foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      props.setPhotoUri(uri);
      photoMutation.mutate(uri);
    }
  }, [photoMutation, props]);

  const currentPhoto = props.photoUri ?? getFullImageUrl(props.dashboard?.photoUrl) ?? null;
  const initials = useMemo(
    () => getInitials(props.dashboard?.name ?? ''),
    [props.dashboard?.name],
  );

  return {
    currentPhoto,
    initials,
    isUploadingPhoto: photoMutation.isPending,
    pickPhoto,
  };
}
