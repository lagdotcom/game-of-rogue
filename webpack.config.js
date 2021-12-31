const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.ts',
    output: {
        path: __dirname + '/docs',
        filename: 'bundle.js',
        clean: true,
    },
    plugins: [new HtmlWebpackPlugin()],
    devtool: 'inline-source-map',
    devServer: {
        static: './docs',
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
    },
    module: {
        rules: [
            { test: /\.ts$/i, use: ['ts-loader'], exclude: /node_modules/ },
            { test: /\.txt$/i, use: ['raw-loader'] },
            { test: /\.(woff|woff2|eot|ttf|otf)$/i, type: 'asset/resource' },
            { test: /\.css$/i, use: ['style-loader', 'css-loader'] },
        ],
    },
};
