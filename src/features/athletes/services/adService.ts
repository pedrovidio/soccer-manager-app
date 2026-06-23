import { appLogger } from '@lib/logger';

interface ShowRewardedAdParams {
  onEarnReward: () => void;
  onAdClose?: () => void;
  onError?: (error: any) => void;
}

export const adService = {
  /**
   * Aciona a exibição do anúncio premiado (Rewarded Ad).
   * Caso o SDK nativo não esteja disponível (Ex: Expo Go), retorna que deve usar o simulador.
   */
  showRewardedAd: async ({ onEarnReward, onAdClose, onError }: ShowRewardedAdParams): Promise<{ isSimulated: boolean }> => {
    appLogger.debug('[AdService] Inicializando carregamento de anúncio premiado.');

    try {
      // Tenta carregar o módulo nativo
      // const mobileAds = require('react-native-google-mobile-ads');
      // Se estivéssemos em uma build nativa, carregaríamos o anúncio real aqui.
      // Para fins de desenvolvimento e compatibilidade direta com Expo Go, forçamos o simulador.
      throw new Error('Nativo indisponível');
    } catch (e) {
      appLogger.debug('[AdService] Ambiente Expo Go detectado. Utilizando simulador visual.');
      return { isSimulated: true };
    }
  }
};
