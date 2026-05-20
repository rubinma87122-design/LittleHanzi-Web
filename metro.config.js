const {getDefaultConfig} = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix the project root resolution
config.watchFolders = [__dirname];

module.exports = config;