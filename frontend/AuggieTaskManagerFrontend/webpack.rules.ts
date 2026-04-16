import type { ModuleOptions } from 'webpack';

const nodeNativeRule: Required<ModuleOptions>['rules'][number] = {
  test: /native_modules[/\\].+\.node$/,
  use: 'node-loader',
};

/** For main process only: rewrites native .node requires for packaging. */
const assetRelocatorRule: Required<ModuleOptions>['rules'][number] = {
  test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
  parser: { amd: false },
  use: {
    loader: '@vercel/webpack-asset-relocator-loader',
    options: {
      outputAssetBase: 'native_modules',
    },
  },
};

const typescriptRule: Required<ModuleOptions>['rules'][number] = {
  test: /\.tsx?$/,
  exclude: /(node_modules|\.webpack)/,
  use: {
    loader: 'ts-loader',
    options: {
      transpileOnly: true,
    },
  },
};

/**
 * Renderer + preload (Forge web / sandboxed targets): no asset relocator.
 * That loader injects `__webpack_require__.ab = __dirname + ...`, which throws
 * in the renderer because `__dirname` does not exist there.
 */
export const webTargetRules: Required<ModuleOptions>['rules'] = [
  typescriptRule,
];

/**
 * Electron main: native .node support + relocator + TypeScript.
 */
export const electronMainRules: Required<ModuleOptions>['rules'] = [
  nodeNativeRule,
  assetRelocatorRule,
  typescriptRule,
];
