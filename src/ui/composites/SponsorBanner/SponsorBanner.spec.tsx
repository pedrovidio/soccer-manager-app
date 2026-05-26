import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { SponsorBanner } from './SponsorBanner';

describe('<SponsorBanner />', () => {
  it('renders no content without an image URL', () => {
    const { queryByLabelText } = render(<SponsorBanner sponsorData={{ imageUrl: null }} />);

    expect(queryByLabelText('Banner do patrocinador')).toBeNull();
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
});
