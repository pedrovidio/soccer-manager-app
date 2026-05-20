const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.resolverMainFields = ['react-native', 'browser', 'module', 'main'];
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  punycode: path.resolve(__dirname, 'node_modules/punycode/punycode.js'),
  ws: path.resolve(__dirname, 'src/lib/supabase/noopWebSocket.js'),
};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'punycode') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'node_modules/punycode/punycode.js'),
    };
  }

  if (moduleName === 'ws' || moduleName.startsWith('ws/')) {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'src/lib/supabase/noopWebSocket.js'),
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
