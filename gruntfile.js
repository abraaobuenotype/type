module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-chokidar');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-shell');

    var path = 'bin/';
    var lib = '../lib/';

    grunt.initConfig({
        copy: {
            target: {
                files: [
                    {
                        expand: true,
                        cwd: 'bin/',
                        src: ["type.js"],
                        dest: 'examples/Align/lib',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bin/',
                        src: ["type.js"],
                        dest: 'examples/CustomAlign/lib',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bin/',
                        src: ["type.js"],
                        dest: 'examples/Input/lib',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bin/',
                        src: ["type.js"],
                        dest: 'examples/Tween/lib',
                        filter: 'isFile'
                    }
                ]
            }
        },

        shell: {
            script: {
                command: 'webpack'
            }
        },

        clean: {
            temp: ['temp']
        },

        chokidar: {
            scripts: {
                files: ['src/**/*.js'],
                tasks: ['shell', 'copy']
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
    grunt.registerTask('build', ['version', 'uglify', 'clean']);

    grunt.registerTask('version', 'adiciona a versão pelo package', function() {
        var pkg = grunt.file.readJSON('package.json');
        var main = grunt.file.read('bin/type.js');
        main = main.replace('__VERSION__', pkg.version);

        grunt.file.write('bin/type.js', main);
    });
};
