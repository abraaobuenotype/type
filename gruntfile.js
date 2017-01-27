module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-chokidar');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-browserify');

    var path = 'bin/';
    var lib = '../lib/';

    grunt.initConfig({
        browserify: {
            dist: {
                files: {
                    'bin/type.js': ['./src/Main.js'],
                    'src/type.js': ['./src/Main.js']
                },
                options: {
                    transform: [
                        'browserify-versionify',
                        [
                            'babelify', {
                                presets: ['es2015'],
                                plugins: [
                                    'babel-plugin-transform-decorators-legacy',
                                    'babel-plugin-transform-class-properties',
                                    'babel-plugin-transform-private-properties'
                                ]
                            }
                        ]
                    ],
                    browserifyOptions:{
                        standalone: 'type-for-pixi'
                    }
                }
            }
        },

        chokidar: {
            scripts: {
                files: ['src/**/*.js'],
                tasks: ['browserify']
            }
        },

        jsdoc: {
            dist: {
                src: ['src/**/*.js', 'README.md'],
                options: {
                    destination: 'documentation',
                    template: "node_modules/jaguarjs-jsdoc",
                    configure: "jsdoc.conf.json"
                }
            }
        },

        uglify: {
            minify: {
                options: {
                    compress: {
                        drop_console: true
                    }
                },
                files: {
                    'bin/type.min.js': 'bin/type.js'
                }
            }
        }
    });

    grunt.registerTask('default', ['chokidar']);
};
