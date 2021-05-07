const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'bundle.v2.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    library: {
      type: 'var',
      name: 'Portfolio',
    },
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: { compilerOptions: { noEmit: false } },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      src: path.resolve(__dirname, 'src'),
    },
  },
  plugins: [new CopyPlugin({ patterns: ['src/api.v2.js'] })],
};
