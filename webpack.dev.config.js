const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: './src/index.js', // 入口文件
  output: {
    path: path.resolve('build'),
    publicPath: '/',
    libraryTarget: 'umd',
    filename: '[name].js',
    umdNamedDefine: true,
  },
  optimization: {
      minimize: true,
  },
  externals : {
      'react': 'react',
      'react-dom': 'react-dom',
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
      }
    ]
  },
  plugins: [
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn/),
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
