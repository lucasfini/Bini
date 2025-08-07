module.exports = {
  presets: [
    'module:@react-native/babel-preset',
    'nativewind/babel',
  ],
  plugins: [
    ['@babel/plugin-transform-class-properties', { loose: true }],
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-transform-private-property-in-object', { loose: true }],
    // Reanimated v3 plugin - MUST be last
    'react-native-reanimated/plugin',
  ],
};