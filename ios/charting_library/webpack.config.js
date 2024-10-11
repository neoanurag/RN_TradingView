const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'BASE_URL': JSON.stringify(process.env.TREADINGVIEW_BASE_URL),   // Inject API_KEY from .env
      'WEB_SOCKET_URL': JSON.stringify(process.env.TREADINGVIEW_WEB_SOCKET_URL), // Inject BROKER_SECRET
      'USERNAME': JSON.stringify(process.env.USERNAME),   
      'PASSWORD': JSON.stringify(process.env.PASSWORD),
      'CRM_EMAIL': JSON.stringify(process.env.CRM_EMAIL),   
      'CRM_PASSWORD': JSON.stringify(process.env.CRM_PASSWORD), 
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};
