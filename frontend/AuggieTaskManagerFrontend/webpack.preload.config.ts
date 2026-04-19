import type { Configuration } from 'webpack';
import { webTargetRules } from './webpack.rules';
import { plugins } from './webpack.plugins';

export const preloadConfig: Configuration = {
  entry: './src/preload/preload.ts',
  target: 'electron-preload', //  critical for preload scripts
  module: { rules: webTargetRules },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json'],
  },
  node: {
    __dirname: false,
    __filename: false,
  },
};
