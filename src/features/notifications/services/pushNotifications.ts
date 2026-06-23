import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Push remotos foram removidos do Expo Go no SDK 53+.
  // Usamos require() dinâmico para nunca carregar o módulo nesse ambiente.
  if (Constants.appOwnership === 'expo') {
    console.log('[PushNotifications] Expo Go detectado — push notifications remotas não suportadas. Use um development build.');
    return null;
  }

  if (!Device.isDevice) {
    console.warn('[PushNotifications] Push notifications só funcionam em dispositivos físicos.');
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Notifications = require('expo-notifications');

    // Cria o canal Android ANTES de solicitar o token (ordem exigida pela API)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[PushNotifications] Permissão negada para notificações push.');
      return null;
    }

    // Passa o projectId explicitamente (obrigatório no SDK 54+)
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      console.warn('[PushNotifications] projectId não encontrado em app.json -> extra.eas.projectId');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    return tokenData.data;
  } catch (error) {
    console.error('[PushNotifications] Erro ao registrar notificações push:', error);
    return null;
  }
}

