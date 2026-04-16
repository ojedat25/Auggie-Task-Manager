import type { Configuration } from 'webpack';

import { webTargetRules } from './webpack.rules';
import { plugins } from './webpack.plugins';

const cssRule = {
  test: /\.css$/,
  use: [
    { loader: 'style-loader' },
    { loader: 'css-loader' },
    { loader: 'postcss-loader' },
  ],
};

export const rendererConfig: Configuration = {
  module: {
    rules: [...webTargetRules, cssRule],
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
