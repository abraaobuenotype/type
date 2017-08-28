const path = require('path');

var isProd = process.env.NODE_ENV === 'production';
console.log(isProd);
var folder = isProd
    ? 'examples/js'
    : 'bin';
var name = isProd
    ? 'type.min.js'
    : 'type.js';

module.exports = {
    entry: './src/Main.js',
    output: {
        path: path.resolve(__dirname, folder),
        filename: name
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                include: [path.resolve(__dirname, "src"), path.resolve(__dirname, "node_modules/opentype"), path.resolve(__dirname, "node_modules/Font")],
                loader: "babel-loader",
                options: {
                    presets: ["env"],
                    plugins: ['babel-plugin-transform-private-properties', 'transform-decorators-legacy', 'transform-class-properties']
                }
            }
        ]
    },

    resolve: {
        alias: {
            Font: path.resolve(__dirname, 'lib/Font.js')
        }
    },

    watch: isProd
}
