module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-chokidar');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-contrib-clean');

    var path = 'bin/';
    var lib = '../lib/';

    grunt.initConfig({
        webpack: {
            someName: {
                entry: './temp/Main.js',
                output: {
                    path: "bin/",
                    filename: "type.js"
                },
                stats: {
                    // Configure the console output
                    colors: false,
                    modules: true,
                    reasons: true
                }
            }
        },

        babel: {
            options: {
                presets: ['es2015'],
                plugins: ['transform-decorators-legacy', 'transform-class-properties', 'babel-plugin-transform-private-properties']
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'src',
                        src: ['**/*.js'],
                        dest: 'temp/',
                        ext: '.js'
                    }
                ]
            }
        },

        clean: {
            temp: ['temp']
        },

        chokidar: {
            scripts: {
                files: ['src/**/*.js'],
                tasks: 'build'
            }
        },

        jsdoc: {
            dist: {
                src: [
                    'src/**/*.js', 'README.md'
                ],
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
    grunt.registerTask('build', ['babel', 'webpack', 'version', 'uglify', 'clean']);

    grunt.registerTask('version', 'adiciona a versão pelo package', function(){
        var pkg = grunt.file.readJSON('package.json');
        var main = grunt.file.read('bin/type.js');
        main = main.replace('__VERSION__', pkg.version);

        grunt.file.write('bin/type.js', main);
    });
};
