'use_strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        updateConfigs: [],
        commit: true,
        push: false,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json', 'bower.json']
      }
    },
    less: {
      options: {
        compress: true
      },
      styles: {
        files: {
          'dist/ez-progress-slider.min.css': ['src/*.less']
        }
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      src: {
        files: {
          src: ['src/**/*.js', 'test/**/*.js']
        },
      }
    },
    ngtemplates: {
      ezProgressSlider: {
        src:      'src/*.html',
        dest:     'dist/ez-progress-slider-tpl.js',
        options: {
          module: 'ez.progressSlider',
          url: function(url) { return url.replace('src/', ''); },
          htmlmin: {
            collapseBooleanAttributes:      true,
            collapseWhitespace:             true,
            removeAttributeQuotes:          true,
            removeComments:                 true,
            removeEmptyAttributes:          true,
            removeRedundantAttributes:      true,
            removeScriptTypeAttributes:     true,
            removeStyleLinkTypeAttributes:  true
          }
        }
      }
    },
    uglify: {
      options: {
        compress: true
      },
      dist: {
        files: {
          'dist/ez-progress-slider.min.js': ['src/ez-progress-slider.js'],
          'dist/ez-progress-slider-tpl.js': ['dist/ez-progress-slider-tpl.js'],
        }
      }
    },
    watch: {
      dev: {
        files: ['src/**'],
        tasks: ['default']
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-angular-templates');

  grunt.registerTask('default', ['jshint', 'ngtemplates', 'uglify', 'less']);

  grunt.registerTask('dev', ['watch:dev']);

};
