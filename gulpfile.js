gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var rename = require('gulp-rename');
var notify = require('gulp-notify'); //when on Windows 7 it falls back to Growl, so this should be installed for best experience.
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');


/********************************************************/
/* Settings and helper functions */
var settings = {
  localhost:          '',
  baseDir:            'www/',
  scriptsDir:         'js/',
  mainLessFile:       'BootstrapColumnCarousel.less',
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

  gulp.src(settings.scriptsDir+'**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    //.pipe(ngAnnotate()) /*include this line only if using angular*/
    .on('error', handleError)
    .pipe(uglify({ mangle: true }))
    .pipe(rename('BootstrapColumnCarousel.min.js'))
    .pipe(gulp.dest(settings.scriptsDir))
    .pipe(reload({stream:true}))
});

gulp.task('less', function () {
  console.log('running task: less');
  gulp.src(settings.stylesDir+settings.mainLessFile)
    .pipe(less())
    .on('error', handleError)
    .pipe(minifyCSS())
    .pipe(rename('BootstrapColumnCarousel.min.css'))
    .pipe(gulp.dest(settings.stylesDir))
    .pipe(reload({stream: true}));
});

gulp.task('default', ['javascript','less','browser-sync'], function() {
  console.log('Gulp task started');

  gulp.watch(settings.baseDir+'**/*.html', ['views-updated']);
  gulp.watch(settings.scriptsDir+'**/*.js', ['javascript']);
  gulp.watch(settings.stylesDir+'**/*.less', ['less']);
});