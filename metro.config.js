const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  '@components': path.resolve(__dirname, 'src/components'),
  '@database': path.resolve(__dirname, 'src/database'),
  '@utils': path.resolve(__dirname, 'src/utils'),
  '@types': path.resolve(__dirname, 'src/types'),
  '@constants': path.resolve(__dirname, 'src/constants'),
  '@theme': path.resolve(__dirname, 'src/theme'),
  '@assets': path.resolve(__dirname, 'assets'),
};

module.exports = config;
