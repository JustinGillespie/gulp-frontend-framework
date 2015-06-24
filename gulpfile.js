var gulp          =   require('gulp-help')(require('gulp')),
    argv          =   require('yargs').argv,
    gutil         =   require('gulp-util'),
    clean         =   require('gulp-clean'),
    plumber       =   require('gulp-plumber'),
    rename        =   require('gulp-rename'),
    concat        =   require('gulp-concat'),
    jshint        =   require('gulp-jshint'),
    watchify      =   require('watchify'),
    browserify    =   require('browserify'),
    minifyify     =   require('minifyify'),
    modernizr     =   require('gulp-modernizr'),
    uglify        =   require('gulp-uglify'),
    imagemin      =   require('gulp-imagemin'),
    cache         =   require('gulp-cache'),
    minifycss     =   require('gulp-minify-css'),
    sass          =   require('gulp-sass'),
    sourcemaps    =   require('gulp-sourcemaps'),
    neat          =   require('node-neat'),
    browserSync   =   require('browser-sync'),
    source        =   require('vinyl-source-stream'),
    buffer        =   require('vinyl-buffer'),
    transform     =   require('vinyl-transform'),
    assign        =   require('lodash.assign');


var settings = {

  url: 'bradydog.dev',

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
    entrypoint: 'main', // entry point of application
    paths:  { 
      src: 'src/js/', 
      dist: 'dist/js/', 
      vendor: 'dist/js/vendor/' 
    },
    browserify: { 
      entries: ['src/js/main.js'],
      noparse: ['jquery'],
      debug: true
    }
  }

} // settings


// Browserify
// http://bit.ly/1ea79JW

var opts = assign({}, watchify.args, settings.javascript.browserify);
var b = watchify(browserify(opts)); 

b.plugin('minifyify', { 
  output: settings.javascript.paths.dist + settings.javascript.entrypoint + '.min.js' 
});

b.on('update', function() {
  compileJS();
}); // on any dep update, runs the bundler

b.on('log', gutil.log); // output build logs to terminal


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
  gutil.log( gutil.colors.yellow('Compiling HTML') );
  gulp.src([settings.pages.paths.src + '**/*.html']).pipe( gulp.dest(settings.pages.paths.dist) )
}

var copySassToDist = function() {
    gulp.src(['src/css/**/*'])
      .pipe( gulp.dest(settings.css.paths.dist + 'src') )
}

var compileSass = function() {
  gutil.log( gutil.colors.yellow('Compiling SASS') );
  copySassToDist();

  gulp.src(['src/css/**/*.scss'])
    .pipe( plumber({ errorHandler: onError }))
    .pipe( sourcemaps.init() )
    .pipe( sass({ includePaths: require('node-neat').includePaths }) )
    .pipe( gulp.dest(settings.css.paths.dist) )
    .pipe( rename({suffix: '.min'}) )
    .pipe( minifycss() )
    .pipe( sourcemaps.write('.', { includeContent: false, sourceRoot:'src' }) )
    .pipe( gulp.dest(settings.css.paths.dist) )
    .pipe( browserSync.reload({stream:true}) );
}

var copyJSToDist = function() {
    gulp.src(['src/js/**/*'])
      .pipe( gulp.dest(settings.javascript.paths.dist + 'src') )
}

var compileJS = function() {
  gutil.log( gutil.colors.yellow('Compiling javascript') );
  copyJSToDist();

  return b.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source(settings.javascript.entrypoint + '.min.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
    .pipe(sourcemaps.write('.', { includeContent: false, sourceRoot:'src/' })) // writes .map file
    .pipe(gulp.dest(settings.javascript.paths.dist))
    .pipe(browserSync.reload({stream:true}));
}

var compileModernizr = function() {
  gutil.log( gutil.colors.yellow('Building custom modernizr script') );

  return gulp.src((settings.javascript.paths.src + '**/*.js'))
    .pipe(modernizr('modernizr.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(settings.javascript.paths.vendor))
}

var compileImages = function() {
  gutil.log( gutil.colors.yellow('Optimizing images') );
  gulp.src(settings.images.paths.src + '**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest(settings.images.paths.dist));
}

var removeDistDirectory = function() {
  gutil.log( gutil.colors.yellow('Removing dist directory') );
  return gulp.src(settings.server.paths.root, {read: false}).pipe(clean());
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
gulp.task('styles-copy', 'Copy source files to dist for better sourcemaps', copySassToDist);

// HTML
gulp.task('html', compileHTML);
gulp.task('pages', compileHTML);

// Image Compression
gulp.task('images', compileImages);


// Utility
gulp.task('clean', 'Removes the build directory', removeDistDirectory);

// Bundled tasks 
gulp.task('build', ['modernizr'], compileAll);
gulp.task('publish', ['modernizr'], compileAll);

// Javascript
gulp.task('modernizr', compileModernizr);
gulp.task('scripts', compileJS);

// Default
gulp.task('default', ['browser-sync'], function() {
  gulp.watch(settings.css.paths.src + '**/*.scss', ['styles']);
  gulp.watch(settings.javascript.paths.src + '**/*.js', ['scripts']);
  gulp.watch(settings.images.paths.src + '**/*', ['images', 'bs-reload']);
  gulp.watch(settings.pages.paths.src + '**/*.html', ['html', 'bs-reload']);
});

