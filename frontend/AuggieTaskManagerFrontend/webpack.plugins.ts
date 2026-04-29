import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

// eslint-disable-next-line @typescript-eslint/no-var-requires
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
    async: true,
    typescript: {
      configFile: 'tsconfig.json',
      diagnosticOptions: {
        semantic: true,
        syntactic: true,
      },
    },
    issue: {
      include: [{ file: '**/src/**/*' }],
    },
  }),
];
