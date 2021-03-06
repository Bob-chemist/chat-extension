const webpack = require('webpack');
const WebpackShellPlugin = require('webpack-shell-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');

const { version } = require('./package.json');

const config = {
    mode: process.env.NODE_ENV,
    context: __dirname + '/src',
    entry: {
        background: './background.js',
        'popup/popup': './popup/popup.js',
        'options/options': './options/options.js',
    },
    output: {
        path: __dirname + '/dist',
        filename: '[name].js',
    },
    resolve: {
        extensions: [ '.js' ],
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpg|gif|svg|ico)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?emitFile=false',
                },
            },
        ],
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: 'icons', to: 'icons', ignore: [ 'icon.xcf' ] },
            {
                from: 'popup/popup.html',
                to: 'popup/popup.html',
            },
            {
                from: 'options/options.html',
                to: 'options/options.html',
            },
            {
                from: 'manifest.json',
                to: 'manifest.json',
                transform: (content) => {
                    const jsonContent = JSON.parse(content);

                    jsonContent.version = version;

                    if (config.mode === 'development') {
                        // eslint-disable-next-line
                        jsonContent['content_security_policy'] = "script-src 'self' 'unsafe-eval'; object-src 'self'";
                    }

                    return JSON.stringify(jsonContent, null, 2);
                },
            },
        ]),
        new WebpackShellPlugin({
            onBuildEnd: [ 'node scripts/remove-evals.js' ],
        }),
    ],
};

if (config.mode === 'production') {
    config.plugins = (config.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"',
            },
        }),
    ]);
}

if (process.env.HMR === 'true') {
    config.plugins = (config.plugins || []).concat([
        new ChromeExtensionReloader(),
    ]);
}

module.exports = config;
