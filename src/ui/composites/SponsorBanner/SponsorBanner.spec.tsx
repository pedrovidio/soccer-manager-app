import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { SponsorBanner } from './SponsorBanner';

const mockUseFeatureAccess = jest.fn();
const mockUsePremium = jest.fn();

jest.mock('@features/app-config/hooks/useFeatureAccess', () => ({
  useFeatureAccess: () => mockUseFeatureAccess(),
}));

jest.mock('../../../hooks/usePremium', () => ({
  usePremium: () => mockUsePremium(),
}));

describe('<SponsorBanner />', () => {
  beforeEach(() => {
    mockUseFeatureAccess.mockReturnValue({
      isFeatureActive: true,
      isLoading: false,
    });
    mockUsePremium.mockReturnValue({ isPremium: false });
  });

  it('renders Google AdMob banner when sponsor image is not available', () => {
    const { getByTestId, queryByLabelText } = render(<SponsorBanner sponsorData={null} />);

    expect(queryByLabelText('Banner do patrocinador')).toBeNull();
    expect(getByTestId('admob-banner-container')).toBeTruthy();
  });

  it('opens the target URL when a sponsored banner is pressed', () => {
    jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(undefined);
    const { getByLabelText } = render(
      <SponsorBanner
        sponsorData={{ imageUrl: 'https://cdn.test/banner.png', targetUrl: 'https://sponsor.test' }}
      />,
    );

    fireEvent.press(getByLabelText('Abrir site do patrocinador'));

    expect(Linking.openURL).toHaveBeenCalledWith('https://sponsor.test');
  });

  it('hides banners when ads are disabled by flag', () => {
    mockUseFeatureAccess.mockReturnValue({
      isFeatureActive: false,
      isLoading: false,
    });

    const { queryByLabelText } = render(
      <SponsorBanner sponsorData={{ imageUrl: 'https://cdn.test/banner.png' }} />,
    );

    expect(queryByLabelText('Banner do patrocinador')).toBeNull();
  });

  it('hides banners for premium athletes', () => {
    mockUsePremium.mockReturnValue({ isPremium: true });

    const { queryByLabelText } = render(
      <SponsorBanner sponsorData={{ imageUrl: 'https://cdn.test/banner.png' }} />,
    );

    expect(queryByLabelText('Banner do patrocinador')).toBeNull();
  });
});
