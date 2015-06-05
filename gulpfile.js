var settings = {

  server: {
    paths: { 
      root: 'dist/' 
    }
  },

  pages: {
    paths: { 
      src: 'src/pages/', 
      dist: 'dist/' 
    }
  },

  images: {
    paths: { 
      src: 'src/img/',
      dist: 'dist/img',
    }
  },

  css: {
    paths: { 
      src: 'src/css/', 
      dist: 'dist/css/', 
      vendor: 'dist/css/vendor/' 
    }
  },

  javascript: {
    paths:  { 
      src: 'src/js/', 
      dist: 'dist/js/', 
      vendor: 'dist/js/vendor/' 
    },
    jquery: { 
      flags: ['-deprecated', '-event/alias', '-ajax/script', '-ajax/jsonp', '-exports/global'],
      version: 2 /* 1 or 2 */
    }
  }

} // settings


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


var compileAll = function() {
  gutil.log( gutil.colors.yellow('Running Sass Tasks...') );
  compileSass();
  gutil.log( gutil.colors.yellow('Running Javascript Tasks...') );
  compileJS();
  gutil.log( gutil.colors.yellow('Running Image Tasks...') );
  compileImages();
  gutil.log( gutil.colors.yellow('Running HTML Tasks...') );
  compileHTML();
}


var compileHTML = function() {
  gulp.src([settings.pages.paths.src + '**/*.html']).pipe( gulp.dest(settings.pages.paths.dist) )
}


var compileSass = function() {
  gulp.src(['src/css/**/*.scss'])
    .pipe( plumber({ errorHandler: onError }))
    .pipe( sourcemaps.init() )
    .pipe( sass({ includePaths: require('node-neat').includePaths }) )
    .pipe( gulp.dest(settings.css.paths.dist) )
    .pipe( rename({suffix: '.min'}) )
    .pipe( minifycss() )
    .pipe( sourcemaps.write('.') )
    .pipe( gulp.dest(settings.css.paths.dist) )
    .pipe( browserSync.reload({stream:true}) );
}


var compileJS = function() {
  return gulp.src(settings.javascript.paths.src + '**/*.js')
    .pipe( plumber({ errorHandler: onError }))
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest(settings.javascript.paths.dist))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest(settings.javascript.paths.dist))
    .pipe(browserSync.reload({stream:true}))
}


var compileModernizr = function() {
  gulp.src((settings.javascript.paths.src + '*.js'))
    .pipe(modernizr())
    .pipe(gulp.dest(settings.javascript.paths.vendor))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest(settings.javascript.paths.vendor))
}


var compileJquery = function() {
  return jquery.src({
      release: settings.javascript.jquery.version,
      flags: settings.javascript.jquery.flags
  })
  .pipe(gulp.dest(settings.javascript.paths.vendor))
  .pipe(rename({suffix: '.min'}))
  .pipe(uglify())
  .pipe(gulp.dest(settings.javascript.paths.vendor));
}


var compileImages = function() {
  gulp.src(settings.images.paths.src + '**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest(settings.images.paths.dist));
}


var onError = function(err) {
  var errorMessage = [
    gutil.colors.red(gutil.colors.underline('\nAn error has occured:\n')),
    gutil.colors.red('"' + err.message + '"'),
    gutil.colors.red(err.fileName + ' (line: ' + err.lineNumber + ')' ),
  ].join('\n');

  console.log(errorMessage);
  gutil.beep();
  this.emit('end');
}


// Web Server
gulp.task('browser-sync', function() {
  browserSync({
    server: { baseDir: settings.server.paths.root }
  });
});

// Live Reload
gulp.task('bs-reload', function () {
  browserSync.reload();
});

// Sass
gulp.task('styles', 'Compile styles!!!!', compileSass);

// HTML
gulp.task('html', compileHTML);
gulp.task('pages', compileHTML);

// Image Compression
gulp.task('images', compileImages);

// Bundled tasks 
gulp.task('build', ['modernizr', 'jquery'], compileAll);
gulp.task('publish', ['modernizr', 'jquery'], compileAll);

// Javascript
gulp.task('jquery', compileJquery);
gulp.task('modernizr', compileModernizr);
gulp.task('scripts', compileJS);

// Default
gulp.task('default', ['browser-sync'], function() {
  gulp.watch(settings.css.paths.src + '**/*.scss', ['styles']);
  gulp.watch(settings.javascript.paths.src + '**/*.js', ['scripts']);
  gulp.watch(settings.images.paths.src + '**/*', ['images', 'bs-reload']);
  gulp.watch(settings.pages.paths.src + '**/*.html', ['html', 'bs-reload']);
});

