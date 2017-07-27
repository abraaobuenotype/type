module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    var path = 'bin/';
    var lib = '../lib/';

    grunt.initConfig({
        copy: {
            target: {
                files: [
                    {
                        expand: true,
                        cwd: 'bin/',
                        src: ["type.min.js"],
                        dest: 'examples/js/',
                        filter: 'isFile'
                    }
                ]
            }
        },

        clean: {
            bin: ['bin/**']
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
        }
    });

    grunt.registerTask('version', 'adiciona a versão pelo package', function() {
        var pkg = grunt.file.readJSON('package.json');
        var main = grunt.file.read('bin/type.js');
        main = main.replace('__VERSION__', pkg.version);

        grunt.file.write('bin/type.js', main);
    });
};
