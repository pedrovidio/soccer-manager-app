jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-google-mobile-ads', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => ({
      initialize: jest.fn().mockResolvedValue({}),
    }),
    BannerAd: ({ testID }) => React.createElement(View, { testID }),
    BannerAdSize: {
      ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER',
    },
    TestIds: {
      BANNER: 'TestIds.BANNER',
    },
  };
});
