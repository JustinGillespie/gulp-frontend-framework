
// Plugins


var gulp          =   require('gulp-help')(require('gulp')),
    gutil         =   require('gulp-util'),
    plumber       =   require('gulp-plumber'),
    rename        =   require('gulp-rename'),
    concat        =   require('gulp-concat'),
    jshint        =   require('gulp-jshint'),
    jquery        =   require('gulp-jquery'),
    modernizr     =   require('gulp-modernizr'),
    uglify        =   require('gulp-uglify'),
    imagemin      =   require('gulp-imagemin'),
    cache         =   require('gulp-cache'),
    minifycss     =   require('gulp-minify-css'),
    sass          =   require('gulp-sass'),
    neat          =   require('node-neat'),
    browserSync   =   require('browser-sync'),
    sourcemaps    =   require('gulp-sourcemaps');


// Settings


var distDirectory =   'dist/',
    srcDirectory  =   'src/',
    cssDirectory  =   'css/';




var settings = {

  css: {
    paths: { src: 'src/css/', dist: 'dist/css/', vendor: 'dist/css/vendor/' }
  },

  javascript: {
    jquery: { 
      flags: ['-deprecated', '-event/alias', '-ajax/script', '-ajax/jsonp', '-exports/global'],
      version: 2 /* 1 or 2 */
    },
    paths:  { src: 'src/js/', dist: 'dist/js/', vendor: 'dist/js/vendor/' }
  }

} // settings






// Error Handling


var onError = function(err) {
  var errorMessage = [
    gutil.colors.red(gutil.colors.underline('\nAn error has occured:\n')),
    gutil.colors.red('"' + err.message + '"'),
    gutil.colors.red(err.fileName + ' (line: ' + err.lineNumber + ')' ),
  ].join('\n');

  gutil.beep();
  console.log(errorMessage);
}

// Compiling (http://xkcd.com/303)

var compileAll = function() {
  gutil.log( gutil.colors.yellow('Running Sass Tasks...') );
  compileSass();
  gutil.log( gutil.colors.yellow('Running HTML Tasks...') );
  compileHTML(); 
}

var compileHTML = function() {
  gulp.src(['src/pages/**/*.html']).pipe( gulp.dest(distDirectory) )
}

var compileSass = function() {
  gulp.src(['src/css/**/*.scss'])
    .pipe( plumber({ errorHandler: onError }))
    .pipe( sourcemaps.init() )
    .pipe( sass({ includePaths: require('node-neat').includePaths }) )
    .pipe( gulp.dest(distDirectory + cssDirectory) )
    .pipe( rename({suffix: '.min'}) )
    .pipe( minifycss() )
    .pipe( sourcemaps.write('.') )
    .pipe( gulp.dest(distDirectory + cssDirectory) )
    .pipe( browserSync.reload({stream:true}) );
}


// Web Server
gulp.task('browser-sync', function() {
  browserSync({
    server: {
       baseDir: "./dist"
    }
  });
});


// Live Reload
gulp.task('bs-reload', function () {
  browserSync.reload();
});


// Image Compression
gulp.task('images', function(){
  gulp.src('src/img/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/img/'));
});




// Sass
gulp.task('styles', 'Compile styles!!!!', compileSass);

// HTML
gulp.task('html', compileHTML);
gulp.task('pages', compileHTML);

// Bundled tasks 
gulp.task('build', ['modernizr', 'jquery'], compileAll);
gulp.task('publish', compileAll);








gulp.task('jquery', function () {
    return jquery.src({
        release: settings.javascript.jquery.version,
        flags: settings.javascript.jquery.flags
    })
    .pipe(gulp.dest(settings.javascript.paths.vendor))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest(settings.javascript.paths.vendor));
});


gulp.task('modernizr', function() {
  gulp.src('./src/js/*.js')
    .pipe(modernizr())
    .pipe(gulp.dest(settings.javascript.paths.vendor))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest(settings.javascript.paths.vendor))
});






// Javascript
gulp.task('scripts', function(){
  return gulp.src('src/js/**/*.js')
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/js/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js/'))
    .pipe(browserSync.reload({stream:true}))
});


// Default
gulp.task('default', ['browser-sync'], function(){
  gulp.watch("src/css/**/*.scss", ['styles']);
  //gulp.watch("src/js/**/*.js", ['scripts']);
  gulp.watch("src/pages/**/*.html", ['html', 'bs-reload']);
});


