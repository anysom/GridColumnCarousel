gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var rename = require('gulp-rename');
var notify = require('gulp-notify'); //when on Windows 7 it falls back to Growl, so this should be installed for best experience.
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var copy = require('gulp-copy');

/********************************************************/
/* Settings and helper functions */
var settings = {
  localhost:          '',
  baseDir:            'www/',
  scriptsDir:         'js/',
  scriptName:         'GridColumnCarousel.js',
  mainSassFile:       'GridColumnCarousel.scss',
  stylesDir:          'css/'
};

settings = function initializeSettings() {
  settings.scriptsDir = settings.baseDir + settings.scriptsDir;
  settings.stylesDir = settings.baseDir + settings.stylesDir;
  return settings;
}();

function handleError(error) {
  console.log('--!!ERROR!!--', error.toString());
  gulp.src('').pipe(notify(error));
  this.emit('end');
}

/********************************************************/

gulp.task('browser-sync', function() {
  console.log('BrowserSync started');

  browserSync({
    server: {
      baseDir: settings.baseDir
    }
  });
});

gulp.task('views-updated', function() {
  console.log('running task: views-updated');

  gulp.src(settings.baseDir+'**/*.html')
    .pipe(reload({stream:true}))
    .pipe(notify('Views updated'));
});

gulp.task('javascript', function() {
  console.log('running task: javascript');

  gulp.src(settings.scriptsDir+settings.scriptName)
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .on('error', handleError)
    .pipe(uglify({ mangle: true }))
    .pipe(rename('GridColumnCarousel.min.js'))
    .pipe(gulp.dest(settings.scriptsDir))
    .pipe(reload({stream:true}))
});

gulp.task('sass', function () {
  gulp.src(settings.stylesDir+settings.mainSassFile)
    .pipe(sass())
    .on('error', handleError)
    .pipe(minifyCSS())
    .pipe(rename('GridColumnCarousel.min.css'))
    .pipe(gulp.dest(settings.stylesDir))
    .pipe(reload({stream: true}));
});

gulp.task('distribute', function () {
  gulp.src([settings.scriptsDir+'GridColumnCarousel.min.js', settings.stylesDir+'GridColumnCarousel.min.css'])
    .pipe(copy('dist', {
      prefix: 2
    }));
});

gulp.task('default', ['javascript','sass','distribute', 'browser-sync'], function() {
  gulp.watch(settings.baseDir+'**/*.html', ['views-updated']);
  gulp.watch(settings.scriptsDir+settings.scriptName, ['javascript', 'distribute']);
  gulp.watch(settings.stylesDir+'**/*.scss', ['sass', 'distribute']);
});