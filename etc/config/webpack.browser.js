/* eslint-env node */
const { configWrapper, commonConfig } = require('./webpack.common');

const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const browserConfig = configWrapper((vars) => {
    const common = commonConfig('browser', true)(vars.env, vars.argv);

    let optionalPlugins = [];

    if (vars.isProduction) {
        optionalPlugins = [
            ...optionalPlugins,
            new webpack.HotModuleReplacementPlugin(),
        ];
    }

    return {
        ...common,

        target: 'web',

        entry: {
            'browser': [ `${vars.dartyRoot}/etc/entryPoints/index.browser.tsx` ],
        },

        output: {
            ...common.output,
        },

        devServer: {
            historyApiFallback: true,
            open: true,
        },

        optimization: {
            ...common.optimization,

            splitChunks: {
                cacheGroups: {
                    'default': false,
                    vendors: false,

                    // vendor chunk
                    vendor: {
                        // name of the chunk
                        name: 'browser-vendors',
                        // async + async chunks
                        chunks: 'all',
                        // import file path containing node_modules
                        test: /[\\/]node_modules[\\/]/,
                        // priority
                        priority: 20,
                    },
                    // common chunk
                    common: {
                        name: 'browser-common',
                        minChunks: 2,
                        chunks: 'async',
                        priority: 10,
                        reuseExistingChunk: true,
                        enforce: true,
                    },
                },
            },
            runtimeChunk: 'single',
        },

        module: {
            ...common.module,

            rules: [
                ...common.module.rules,
                {
                    test: /\.(eot|ttf|jpe?g|png|gif|ico)([?]?.*)$/i,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[ext]',
                                outputPath: 'assets/',
                            },
                        },
                    ],
                },
                {
                    test: /\.(woff2?|ttf|otf|eot)([?]?.*)$/i,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                name: '[name].[ext]',
                                outputPath: 'assets/',
                            },
                        },
                    ],
                },
                {
                    test: /\.(svg)([?]?.*)$/,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 10000,
                                mimetype: 'image/svg+xml',
                                name: '[name].[ext]',
                                outputPath: 'assets/',
                            },
                        },
                    ],
                },
            ],
        },

        plugins: [
            ...common.plugins,
            new CopyWebpackPlugin({
                patterns: vars.manifest.staticFiles.map(x => ({ from: x, to: './', flatten: true })),
            }),
            ...Object.keys(vars.manifest.htmlTemplates).map(filename => new HtmlWebpackPlugin({
                title: vars.manifest.title,
                filename: filename,
                template: vars.manifest.htmlTemplates[filename],
                // inject: false,
            })),
            ...optionalPlugins,
        ],

        node: {
            dgram: 'empty',
            fs: 'empty',
            net: 'empty',
            tls: 'empty',
            child_process: 'empty',
        },
    };
});

module.exports = browserConfig;
