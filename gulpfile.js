var fs = require('fs')
var gulp = require('gulp')
var babel = require('gulp-babel')
var newer = require('gulp-newer')
var plumber = require('gulp-plumber')
var through = require('through2')
var log = require('gulp-util').log
var colors = require('gulp-util').colors
var relative = require('path').relative
var browserify = require('browserify')

var src = 'src/**/*.js'
var dest = 'lib/'

function transpile () {
  return gulp.src(src)
    .pipe(plumber())
    .pipe(newer(dest))
    .pipe(through.obj(function (file, enc, cb) {
      var path = relative(__dirname, file.path)
      log('Compiling \'' + colors.cyan(path) + '\'...')
      cb(null, file)
    }))
    .pipe(babel())
    .pipe(gulp.dest(dest))
}

function bundle () {
  return browserify('./lib/index.js', { node: true })
    .plugin('browser-pack-flat')
    .bundle()
    .pipe(fs.createWriteStream('./lib/ircs.js'))
}

var build = gulp.series(transpile, bundle)

function watch () {
  gulp.watch(src, build)
}

module.exports = {
  build,
  watch,
  default: build
}
