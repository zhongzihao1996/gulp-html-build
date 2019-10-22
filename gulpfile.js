const gulp = require("gulp");
const gulp_concat = require("gulp-concat");
const gulp_uglify = require('gulp-uglify');
const gulp_less = require("gulp-less");
const gulp_clean_css = require("gulp-clean-css");
const gulp_htmlmin = require("gulp-htmlmin");
const browserSync = require('browser-sync').create();
const gulp_watch = require('gulp-watch');
const path = require('path');
const glob = require('glob');

const browserify = require("browserify");
const tsify = require("tsify");
const source = require('vinyl-source-stream');


gulp.task('build-html', buildHtml);

gulp.task('build-less', buildLess);

gulp.task('build-css', gulp.series('build-less', buildCss));

gulp.task('build-js', buildJs);

gulp.task('browser', () => {
  browserSync.init({
    server: './dist'
  });
  gulp_watch(getEntry('src/ts/*.ts'),
    gulp.series('build-js', () => {
      browserSync.reload();
    })
  );
  gulp_watch(getEntry('src/pages/*.html'),
    gulp.series('build-html', () => {
      browserSync.reload();
    })
  );
});

gulp.task('default', gulp.series('build-html', 'build-css', 'build-js', 'browser'));

function buildHtml() {
  return gulp.src('src/pages/*.html')
    .pipe(gulp_htmlmin())
    .pipe(gulp.dest('dist/'))
}

function buildLess() {
  return gulp.src('src/less/*.less')
    .pipe(gulp_less())
    .pipe(gulp.dest('src/css/'))
}

function buildCss() {
  return gulp.src('src/css/*.css')
    .pipe(gulp_concat('bundle.css'))
    .pipe(gulp_clean_css({
      compatibility: 'ie8',
    }))
    .pipe(gulp.dest('dist/css'))
}

function buildJs() {
  return browserify({
      basedir: '.',
      debug: true,
      entries: ['src/ts/index.ts'],
      cache: {},
      packageCache: {}
    })
    .plugin(tsify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest("dist/js/"));
}

function getEntry(filepath) {
  try {
    return glob.sync(filepath);
  } catch (e) {
    console.log(e);
  }
};
