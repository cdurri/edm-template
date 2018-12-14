var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence').use(gulp);
var pug = require('gulp-pug');
var watch = require('gulp-watch');
var rename = require('gulp-rename');
var inlineCSS = require('gulp-inline-css');
const autoprefixer = require('gulp-autoprefixer');
const gulpLoadPlugins = require('gulp-load-plugins');
const plugins = gulpLoadPlugins();

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: './app'
    }
  });
});

gulp.task('sass', function() {
  return gulp.src(['app/sass/**/*.scss', '!app/sass/file-style-header']) //Source all files ending with.scss in scss directory and its subdirectories
    .pipe(plugins.plumber({
      errorHandler: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(sass())
    .pipe(rename('styles.css'))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest('app/css'))
});

gulp.task('criticalCSS', () => {
  return gulp.src('app/sass/criticalCSS.scss')
    .pipe(plugins.plumber({
      errorHandler: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(plugins.sass.sync({
      outputStyle: 'compressed',
      precision: 10,
      includePaths: ['.']
    }).on('error', plugins.sass.logError))
    .pipe(plugins.autoprefixer({
      browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']
    }))
    .pipe(gulp.dest('dist/css'))
});

gulp.task('watch', function() {
  gulp.watch('app/sass/**/*.scss', ['sass']);
  gulp.watch('app/views/**/*.pug', ['pug']);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/css/*.css', browserSync.reload);
});

gulp.task('useref', function() {
  return gulp.src('app/*.html') //Source all html files
    .pipe(useref())
    .pipe(gulpIf('*.css', cssnano())) //Minifies only if it is css file
    .pipe(gulp.dest('dist'))
});

gulp.task('inline', function() {
  return gulp.src(['app/*.html', '!app/home.html'])
    .pipe(inlineCSS({
      applyStyleTags: true,
      removeStyleTags: false
    }))
    .pipe(gulp.dest('dist'))
});

gulp.task('lic', function() {
  return gulp.src('app/*.md') //Source all license files
    .pipe(gulp.dest('dist'))
});


gulp.task('clean:dist', function() {
  return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});

gulp.task('clean:app', function() {
  return del.sync(['app/css/styles.css', 'app/*.html', 'dist']);
});

gulp.task('pug', function buildHTML() {
  return gulp.src(['!app/views/_*.pug', 'app/views/*.pug'])
    .pipe(plugins.plumber())
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest('app'))
});

gulp.task('build', function(callback) {
  runSequence('clean:dist', ['sass', 'criticalCSS', 'pug', 'useref', 'lic'], 'inline', callback);
});

gulp.task('clean', function(callback) {
  runSequence('clean:dist', 'clean:app', callback);
});

gulp.task('default', function(callback) {
  runSequence(['sass', 'criticalCSS', 'pug', 'browserSync', 'watch'], callback);
});
