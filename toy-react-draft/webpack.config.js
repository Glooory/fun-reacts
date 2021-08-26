const path = require('path');

module.exports = {
  entry: {
    main: './src/main.js',
  },
  module: {
    rules: [
      {
        test: /\*.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            preset: ['@babel-preset/env']
          }
        }
      }
    ]
  }
}
