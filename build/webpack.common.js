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
      '../../@polymer': '/var/www/html/@ggcity/leaflet-map-selector/node_modules/@polymer',
      '../../@material': '/var/www/html/@ggcity/leaflet-map-selector/node_modules/@material',
      '../../material-components-web': '/var/www/html/@ggcity/leaflet-map-selector/node_modules/material-components-web',
      '../../leaflet': '/var/www/html/@ggcity/leaflet-map-selector/node_modules/leaflet'
    }
  },
  module: {
    rules: [
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
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist'])
  ]
};
