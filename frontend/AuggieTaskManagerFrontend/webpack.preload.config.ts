import type { Configuration } from 'webpack';
import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

export const preloadConfig: Configuration = {
  entry: './src/preload/preload.ts',
  target: 'electron-preload', //  critical for preload scripts
  module: { rules },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json'],
    fallback: {
      path: require.resolve('path-browserify'), //  polyfill Node 'path'
    },
  },
  node: {
    __dirname: false,
    __filename: false,
  },
};