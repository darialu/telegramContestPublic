'use strict';

const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin');

var rootDir = process.cwd() + '/';

var babelLoader = {
    loader: 'babel-loader',
    options: {
      presets: [
        [
          require.resolve('babel-preset-es2015'),
          { loose: true, options: { modules: true } }
        ]
      ],
      plugins: [
        require.resolve('babel-plugin-transform-object-assign'),
        require.resolve('babel-plugin-transform-object-rest-spread'),
        require.resolve('babel-plugin-transform-class-properties')
      ],
      cacheDirectory: rootDir + '.cache/babel-cache/'
    }
  };

var babelInclude = [
    /src\/(?:[^/]*(?:\/|$))*$/,
];

module.exports = {

    mode: 'development',

    entry: './src/index.js',

    devtool: 'eval-source-map',

    output: {
        path: path.resolve(__dirname, 'build'),
        publicPath: '/build/',
        filename: 'project.bundle.js'
    },

    devServer: {
        contentBase: path.join(__dirname, 'build'),
        compress: true,
        port: 8000,
        writeToDisk: true
    },

    resolve: {
        alias: {
          src: path.resolve(__dirname, 'src/')
        }
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                include: babelInclude,
                use: [
                    {
                    loader: 'unlazy-loader',
                    options: {}
                    },
                    babelLoader,
                    // ifDefLoader
                ]
            },
            {
                test: [ /\.vert$/, /\.frag$/ ],
                use: 'raw-loader'
            }
        ]
    },

    plugins: [
        // new ExtraWatchWebpackPlugin({
        //     dirs: [ 'assets', '.' ],
        // }),
        new CopyWebpackPlugin([{
            from: 'assets/*',
            to: '.'
        }, {
            from: 'index.html',
            to: '.'
        }, {
            from: 'styles/*',
            to: '.'
        }, {
            from: 'assets/fonts/**',
            to: '.',
            ignore: 'assets/**/*.bmglyph'
        }], { writeToDisk: true, copyUnmodified: true }),
        new webpack.DefinePlugin({
            'CANVAS_RENDERER': JSON.stringify(true),
            'WEBGL_RENDERER': JSON.stringify(true)
        })
    ]

};
