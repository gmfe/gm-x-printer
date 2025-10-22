const webpack = require('webpack')
const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

const watch = process.env.WATCH === 'true'

module.exports = {
  mode: watch ? 'development' : 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve('lib'),
    publicPath: '/',
    libraryTarget: 'commonjs',
    filename: '[name].js'
  },
  externals: watch
    ? {}
    : {
        react: 'react',
        'react-dom': 'react-dom',
        lodash: 'lodash'
      },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader'
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /(fontawesome-webfont|glyphicons-halflings-regular|iconfont)\.(woff|woff2|ttf|eot|svg)($|\?)/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1024,
              name: 'font/[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\/svg\/(\w|\W)+\.svg$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              icon: true,
              expandProps: 'start',
              svgProps: {
                fill: 'currentColor',
                // className 冗余
                className:
                  "{'gm-svg-icon t-svg-icon m-svg-icon ' + (props.className || '')}"
              }
            }
          }
        ]
      },
      {
        test: /\\svg\\(\w|\W)+\.svg$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              icon: true,
              expandProps: 'start',
              svgProps: {
                fill: 'currentColor',
                // className 冗余
                className:
                  "{'gm-svg-icon t-svg-icon m-svg-icon ' + (props.className || '')}"
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn/)
    // new BundleAnalyzerPlugin(),
  ],
  devServer: {
    open: true,
    compress: true,
    port: 5678,
    inline: false,
    disableHostCheck: true,
    proxy: {
      '/gm_account/*': {
        target: 'https://manage.guanmai.cn',
        changeOrigin: true
      }
    }
  }
}
