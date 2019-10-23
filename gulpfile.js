const gulp = require('gulp');
const gulp_htmlmin = require('gulp-htmlmin');
const gulp_concat = require('gulp-concat');
const gulp_less = require('gulp-less');
const gulp_autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const gulp_watch = require('gulp-watch');
const path = require('path');
const glob = require('glob');
const browserify = require('browserify');
const tsify = require('tsify');
const source = require('vinyl-source-stream');
const htmltpl = require('gulp-html-tpl'); // 引用html模板
const artTemplate = require('art-template'); // 模板渲染
const gulp_rev_dxb = require('gulp-rev-dxb'); // 生成版本号清单
const gulp_revCollector = require('gulp-rev-collector-dxb') // 替换成版本号文件
const del = require('del');

gulp.task('clean-html', () => {
  return del(glob.sync('/dist/*.html'));
})

gulp.task('clean-css', () => {
  return del(['dist/css']);
})

gulp.task('clean-js', async () => {
  return del(['dist/js']);
})

gulp.task('build-html', gulp.series('clean-html', buildHtml));

gulp.task('build-css', gulp.series('clean-css', buildCss));

gulp.task('build-js', gulp.series('clean-js', buildJs));

gulp.task('build-version-json', buildVersionJson);

gulp.task('set-html-version', setHtmlVersion);

gulp.task('browser', () => {
  browserSync.init({
    server: './dist',
  });
  gulp_watch(
    glob.sync('src/entrys/*.ts'),
    gulp.series('build-js', () => {
      browserSync.reload();
    })
  );
  gulp_watch(
    glob.sync('src/pages/*.less'),
    gulp.series('build-css', () => {
      browserSync.reload();
    })
  );
  gulp_watch(
    glob.sync('src/**/*.html'),
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
        paths: ['src/components/'],
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

async function buildCss() {
  let entries = getEntry('src/pages/*.less');
  let keys = Object.keys(entries);
  for (let i = 0, len = keys.length; i < len; i++) {
    await gulp
      .src(entries[keys[i]])
      .pipe(gulp_less())
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
      .pipe(gulp_concat(`${keys[i]}.css`))
      .pipe(gulp.dest('dist/css'));
  }
}

async function buildJs() {
  let entries = getEntry('src/entrys/*.ts');
  let keys = Object.keys(entries);
  for (let i = 0, len = keys.length; i < len; i++) {
    await browserify({
        entries: entries[keys[i]],
        cache: {},
        packageCache: {},
      })
      .plugin(tsify)
      .bundle() // 转成node readabel stream流
      .pipe(source(`${keys[i]}.js`))
      .pipe(gulp.dest('dist/js/'));
  }
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
  const entries = {};
  try {
    glob.sync(filepath).forEach(file => {
      const basename = path.basename(file, path.extname(file));
      entries[basename] = file;
    });
    // console.log(entries);
    return entries;
  } catch (e) {
    console.log(e);
    throw e
  }
}
