const path = require('path');

module.exports = {
    entry: './src/Main.js',
    output: {
        path: path.resolve(__dirname, 'bin'),
        filename: 'type.js'
    },

    module: {
        rules:[
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, "src")
                ],
                loader: "babel-loader",
                options: {
                    presets: ['env'],
                    plugins: [
                        'babel-plugin-transform-private-properties',
                        'transform-decorators-legacy',
                        'transform-class-properties'
                    ]
                }
            }
        ]
    }
}
