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
      '../../leaflet': '/var/www/html/@ggcity/leaflet-map-selector/node_modules/leaflet',
      '../../js-yaml': '/var/www/html/@ggcity/leaflet-map-selector/node_modules/js-yaml'
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
