import type { Configuration } from 'webpack';
import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';
import path from 'path';

export const mainConfig: Configuration = {
  entry: './src/main/main.ts',
  module: { rules },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    fallback: {
      path: require.resolve('path-browserify'), // <-- polyfill path
    },
  },
  target: 'electron-main', // important for Node context
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: {
    electron: 'commonjs electron', // keep electron native
    fs: 'commonjs fs',             // keep fs native
  },
};