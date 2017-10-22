var browserify = require('browserify'),
    gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    plumber = require('gulp-plumber'),
    browserSync = require('browser-sync'),
    exec = require('child_process').exec;

/* pathConfig*/
var entryPoint = './lib/main.js',
    sassWatchPath = './sass/**/*.scss',
    jsWatchPath = './lib/**/*.js',
    templateWatchPath = './templates/**/*.twig';
/**/

var onError = function (err) {
  console.log(err);
  this.emit("end");
};

gulp.task('js', function () {
  return browserify(entryPoint, {debug: true, extensions: ['es6']})
    .transform("babelify", {presets: ["es2015"]})
    .bundle()
    .on('error', onError)
    .pipe(source('global-script.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./js/'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('browser-sync', function () {
  const config = {
    proxy: 'barbarito.dev',
    reloadDelay: 1000,
    injectChanges: true,
  };

  return browserSync(config);
});

gulp.task('drush:cc', function() {
  exec('drush cc render');
});

gulp.task('sass', function () {
  return gulp.src(sassWatchPath)
             .pipe(plumber({
               errorHandler: onError
             }))
             .pipe(sourcemaps.init())
             .pipe(sass().on('error', sass.logError))
             .pipe(autoprefixer({
               browsers: ['last 2 versions']
             }))
             .pipe(sourcemaps.write())
             .pipe(gulp.dest('./css'))
             .on('end', () => {
               browserSync.reload();
             });
});

gulp.task('watch', function () {
  gulp.watch(jsWatchPath, ['js']);
  gulp.watch(sassWatchPath, ['sass']);
  gulp.watch(templateWatchPath, ['drush:cc', function() { browserSync.reload(); }]);
});

gulp.task('run', ['js', 'sass', 'watch', 'browser-sync']);
