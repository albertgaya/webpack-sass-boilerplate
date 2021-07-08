const Path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const Webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = (_, argv) => {
    const IsProduction = argv.mode === 'production'

    return {
        entry: [
            Path.resolve(__dirname, 'src/sass/main.scss'),
            Path.resolve(__dirname, 'src/js/main.js'),
        ],

        devtool: 'inline-source-map',

        output: {
            publicPath: Path.resolve(__dirname, 'dist'),
            filename: 'js/[' + (IsProduction ? 'hash' : 'name') + '].js',
            chunkFilename: 'js/[' + (IsProduction ? 'hash' : 'name') + '].js',
        },

        module: {
            rules: [
                {
                    test: /\.scss$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        { loader: 'css-loader', options: { sourceMap: !IsProduction } },
                        { loader: 'postcss-loader', options: { sourceMap: !IsProduction } },
                        {
                            loader: 'sass-loader', options: {
                                sourceMap: !IsProduction,
                                sassOptions: {
                                    includePaths: [Path.resolve(__dirname, 'node_modules')]
                                }
                            }
                        }
                    ]
                },

                {
                    test: /\.(png|jpe?g|gif|svg|ttf|otf|eot|woff(2)?)(\?[=\.a-z0-9]+)?$/i,
                    use: {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: (url, resourcePath, context) => !/fonts/i.test(Path.relative(context, resourcePath)) ? `images/${url}` : `fonts/${url}`,
                            publicPath: (url, resourcePath, context) => !/fonts/i.test(Path.relative(context, resourcePath)) ? `../images/${url}` : `../fonts/${url}`
                        }
                    }
                },

                {
                    test: /\.m?js$/,
                    exclude: /(node_modules)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                }
            ]
        },

        plugins: [
            new CleanWebpackPlugin({ cleanStaleWebpackAssets: IsProduction }),
            new MiniCssExtractPlugin({ filename: 'css/[' + (IsProduction ? 'hash' : 'name') + '].css' }),
            new OptimizeCssAssetsPlugin({ cssProcessorOptions: { map: { inline: true } } }),
            new CopyWebpackPlugin({
                patterns: [{
                    from: './src/images', to: 'images', noErrorOnMissing: true, globOptions: {
                        dot: true,
                        ignore: ['**/.gitkeep']
                    }
                }]
            }),
            new Webpack.ProvidePlugin({
                '$': 'jquery',
                'jQuery': 'jquery',
                'window.jQUery': 'jquery'
            }),
            new HtmlWebpackPlugin({
                title: 'Home Pages',
                template: './src/templates/index.html',
                publicPath: './'
            })
        ],

        optimization: {
            minimizer: [new OptimizeCssAssetsPlugin(), new UglifyJsPlugin({ sourceMap: true })]
        }
    }
}