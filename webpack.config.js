const path = require('path');
const webpack = require('webpack');

module.exports = {
  target: 'electron',
  node: {
    __dirname: false,
    __filename: false
  },
  resolve: {
    extensions: [ '.js', '.jsx' ]
  },
  entry: {
    main: './src/main/index.js',
    renderer: './src/renderer/index.js',
    captureWindow: './src/renderer/captureWindow.js'
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: './dist/',
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },

      {
        test: /\.css$/,
        loaders: ["style-loader", "css-loader?modules"]
      }
    ]
  },
  devtool: 'source-map'
};
