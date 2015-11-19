var gulp = require('gulp'),
    ts = require('gulp-typescript'),
    merge = require('merge2'),
    sourcemaps = require('gulp-sourcemaps'),
    rimraf = require('rimraf'),
    mocha = require('gulp-mocha')
    
var paths = {
  source: 'src',
  root: 'build',
  test: 'build/test',
  definitions: 'build/definitions',
  tsconfig: 'src/tsconfig.json',
  sourceRoot: '../../src'
}

var tsconfig = {
  module: 'commonjs',
  removeComments: true,
  declaration: true
}

gulp.task('clean', function (cb) {
  rimraf(paths.root, cb)
})

gulp.task('build', ['clean'], function () {
  var project = ts.createProject(paths.tsconfig, tsconfig)
  
  var tsResult = project.src()
    .pipe(sourcemaps.init())
    .pipe(ts(project))
  
  return merge([
    tsResult.dts.pipe(gulp.dest(paths.definitions)),
    tsResult.js.pipe(sourcemaps.write('.', { sourceRoot: paths.sourceRoot })).pipe(gulp.dest(paths.root))
  ])
})

gulp.task('test', function () {
  return gulp.src(paths.test + '/**/*.js', { read: false })
    .pipe(mocha({ reporter: 'spec', require: ['source-map-support/register'] }))
})

gulp.task('clean-release', function (cb) {
  rimraf('release', cb)
})

gulp.task('release', ['clean-release'], function () {
  return merge([
    gulp.src(['build/lib/**/*']).pipe(gulp.dest('release/lib')),
    gulp.src(['build/definitions/lib/**/*']).pipe(gulp.dest('release/definitions')),
    gulp.src(['package.json', 'LICENSE', 'README.md']).pipe(gulp.dest('release'))
  ])
})