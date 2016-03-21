module.exports = function(grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
          options: {
            // define a string to put between each file in the concatenated output
            separator: ';'
          },
          dist: {
            // the files to concatenate
            src: [
            'libs/twkb.min.js',
            'src/core/d3.mappu.util.js',
            'src/core/d3.mappu.Cache.js',
            'src/map/d3.mappu.Map.js',
            'src/sketch/d3.mappu.Sketch.js',
            'src/layer/d3.mappu.Layer.js',
            'src/layer/d3.mappu.VectorLayer.js',
            'src/layer/d3.mappu.VectorTileLayer.js',
            'src/layer/d3.mappu.TWKBLayer.js',
            'src/layer/d3.mappu.RasterDivLayer.js',
            'src/core/d3.mappu.Controllers.js',
            'src/core/d3.mappu.Coordinates.js'
            ],
            // the location of the resulting JS file
            dest: 'dist/<%= pkg.name %>.js'
          }
        },
       uglify: {
          options: {
            // the banner is inserted at the top of the output
            banner: '/*! <%= pkg.name %> VERSION: <%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
          },
          dist: {
            files: {
              'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
            }
          }
        },
        watch: {
          files: ['src/*.js'],
          tasks: ['jshint', 'qunit']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('watch', ['concat','uglify']);
    grunt.registerTask('default', ['concat','uglify']);
};
