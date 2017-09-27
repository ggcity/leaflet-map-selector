const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: '../leaflet-map-selector.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../dist')
  },
  resolve: {
    alias: {
      '../../@ggcity' : path.resolve(__dirname, '../node_modules/@ggcity'),
      '../../@polymer': path.resolve(__dirname, '../node_modules/@polymer'),
      '../../leaflet':  path.resolve(__dirname, '../node_modules/leaflet'),
      '../../js-yaml':  path.resolve(__dirname, '../node_modules/js-yaml')
    }
  },
  module: {
    rules: [
      { 
        test: /\.js$/, 
        loader: "babel-loader",
        include: [
          path.join(__dirname, '..'),
          /\/node_modules\/@polymer/
        ],
        options: {
          presets: [
            'babel-preset-env'
          ].map(require.resolve)
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg)$/,
        use: [
          'file-loader'
        ]
      },
      {
        test: /\.json$/,
        use: [
          'json-loader'
        ]
      },
      {
        test: /\.html$/,
        use: [
          'raw-loader'
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist'])
  ]
};
