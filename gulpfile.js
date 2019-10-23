const gulp = require('gulp');
const gulp_htmlmin = require('gulp-htmlmin');
const gulp_concat = require('gulp-concat');
const gulp_less = require('gulp-less');
const gulp_autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const gulp_watch = require('gulp-watch');
const glob = require('glob');
const browserify = require('browserify');
const tsify = require('tsify');
const source = require('vinyl-source-stream');
const htmltpl = require('gulp-html-tpl'); // 引用html模板
const artTemplate = require('art-template'); // 模板渲染
const gulp_rev_dxb = require('gulp-rev-dxb'); // 生成版本号清单
const gulp_revCollector = require('gulp-rev-collector-dxb') // 替换成版本号文件

gulp.task('build-html', buildHtml);

gulp.task('build-less', buildLess);

gulp.task('build-css', gulp.series('build-less', buildCss));

gulp.task('build-js', buildJs);

gulp.task('build-version-json', buildVersionJson);

gulp.task('set-html-version', setHtmlVersion);

gulp.task('browser', () => {
  browserSync.init({
    server: './dist',
  });
  gulp_watch(
    getEntry('src/ts/*.ts'),
    gulp.series('build-js', () => {
      browserSync.reload();
    })
  );
  gulp_watch(
    getEntry('src/less/*.less'),
    gulp.series('build-css', () => {
      browserSync.reload();
    })
  );
  gulp_watch(
    getEntry('src/pages/**/*.html'),
    gulp.series('build-html', () => {
      browserSync.reload();
    })
  );
});

gulp.task('default', gulp.series('build-html', 'build-css', 'build-js', 'build-version-json', 'set-html-version', 'browser'));

function buildHtml() {
  return gulp
    .src('src/pages/*.html')
    .pipe(
      htmltpl({
        tag: 'template',
        paths: ['src/pages/components/'],
        engine(template, data) {
          return template && artTemplate.compile(template)(data);
        },
        data: {
          //初始化数据
          header: false,
          g2: false,
        },
      })
    )
    .pipe(gulp.dest('dist/'));
}

function buildLess() {
  return gulp
    .src('src/less/*.less')
    .pipe(gulp_less())
    .pipe(gulp.dest('src/css/'));
}

function buildCss() {
  return gulp
    .src('src/css/*.css')
    .pipe(gulp_autoprefixer({
      overrideBrowserslist: [
        "Android 4.1",
        "iOS 7.1",
        "Chrome > 31",
        "ff > 31",
        "ie >= 8"
      ],
      grid: true,
    }))
    .pipe(gulp_concat('bundle.css'))
    .pipe(gulp.dest('dist/css'));
}

function buildJs() {
  return browserify({
      basedir: '.',
      debug: true,
      entries: ['src/ts/index.ts'],
      cache: {},
      packageCache: {},
    })
    .plugin(tsify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dist/js/'));
}

function buildVersionJson() {
  return gulp.src(['./dist/js/**', './dist/css/**'])
    .pipe(gulp_rev_dxb())
    .pipe(gulp_rev_dxb.manifest())
    .pipe(gulp.dest("./"));
}

function setHtmlVersion() {
  return gulp.src(['./rev-manifest.json', './dist/*.html'])
    .pipe(gulp_revCollector()) // 根据.json文件 执行文件内js/css名的替换
    .pipe(gulp_htmlmin({
      removeComments: true, // 清除HTML注释
      collapseWhitespace: true, // 压缩HTML
      minifyJS: true, // 压缩页面JS
      minifyCSS: true // 压缩页面CSS
    }))
    .pipe(gulp.dest('./dist'));
}

function getEntry(filepath) {
  try {
    return glob.sync(filepath);
  } catch (e) {
    console.log(e);
  }
}
