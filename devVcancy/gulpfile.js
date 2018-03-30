// Generated on 2017-09-14 using generator-angular 0.16.0
'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var openURL = require('open');
var gulpif = require('gulp-if');
var lazypipe = require('lazypipe');
var rimraf = require('rimraf');
var wiredep = require('wiredep').stream;
var runSequence = require('run-sequence');

var yeoman = {
  app: require('./bower.json').appPath || 'app',
  dist: './dist'
};

var paths = {
  scripts: [yeoman.app + '/scripts/app.js', yeoman.app + '/scripts/**/*.js',yeoman.app + '/assets/**/*.js'],
  styles: [yeoman.app + '/styles/**/*.css'],
   assets: [yeoman.app + '/assets/**/*.css'],
  test: ['test/spec/**/*.js'],
  testRequire: [
    yeoman.app + '/bower_components/angular/angular.js',
    yeoman.app + '/bower_components/angular-mocks/angular-mocks.js',
    yeoman.app + '/bower_components/angular-resource/angular-resource.js',
    yeoman.app + '/bower_components/angular-cookies/angular-cookies.js',
    yeoman.app + '/bower_components/angular-sanitize/angular-sanitize.js',
    yeoman.app + '/bower_components/angular-route/angular-route.js',
    'test/mock/**/*.js',
    'test/spec/**/*.js'
  ],
  karma: 'karma.conf.js',
  views: {
    main: yeoman.app + '/index.html',
    files: [yeoman.app + '/views/**/*.html']
  }
};

////////////////////////
// Reusable pipelines //
////////////////////////

var lintScripts = lazypipe()
  .pipe($.jshint, '.jshintrc')
  .pipe($.jshint.reporter, 'jshint-stylish');

var styles = lazypipe()
  .pipe($.autoprefixer, 'last 1 version')
  .pipe(gulp.dest, '.tmp/styles');
var assets = lazypipe()
  .pipe($.autoprefixer, 'last 1 version')
  .pipe(gulp.dest, '.tmp/assets');

///////////
// Tasks //
///////////

gulp.task('styles', function () {
  return gulp.src(paths.styles)
    .pipe(styles());
});
gulp.task('assets', function () {
  return gulp.src(paths.assets)
    .pipe(assets());
});
gulp.task('lint:scripts', function () {
  return gulp.src(paths.scripts)
    .pipe(lintScripts());
});

gulp.task('clean:tmp', function (cb) {
  rimraf('./.tmp', cb);
});

gulp.task('start:client', ['start:server', 'styles'], function () {
  openURL('http://localhost:9000');
});

gulp.task('start:server', function() {
  $.connect.server({
    root: [yeoman.app, '.tmp'],
    livereload: true,
    // Change this to '0.0.0.0' to access the server from outside.
    port: 9000,
  middleware:function(connect, opt){
      return [['/bower_components', 
        connect["static"]('./bower_components')]]
    }
  });
});

gulp.task('start:server:test', function() {
  $.connect.server({
    root: ['test', yeoman.app, '.tmp'],
    livereload: true,
    port: 9001
  });
});

gulp.task('watch', function () {
  $.watch(paths.styles)
    .pipe($.plumber())
    .pipe(styles())
    .pipe($.connect.reload());

  $.watch(paths.views.files)
    .pipe($.plumber())
    .pipe($.connect.reload());

  $.watch(paths.scripts)
    .pipe($.plumber())
    .pipe(lintScripts())
    .pipe($.connect.reload());

  $.watch(paths.test)
    .pipe($.plumber())
    .pipe(lintScripts());

  gulp.watch('bower.json', ['bower']);
});

gulp.task('serve', function (cb) {
  runSequence('clean:tmp',
    // ['lint:scripts'],
    ['start:client'],
    'watch', cb);
});

gulp.task('serve:prod', function() {
  $.connect.server({
    root: [yeoman.dist],
    livereload: true,
    port: 9000
  });
});

gulp.task('test', ['start:server:test'], function () {
  var testToFiles = paths.testRequire.concat(paths.scripts, paths.test);
  return gulp.src(testToFiles)
    .pipe($.karma({
      configFile: paths.karma,
      action: 'watch'
    }));
});

// inject bower components
gulp.task('bower', function () {
  return gulp.src(paths.views.main)
    .pipe(wiredep({
      directory: yeoman.app + '/bower_components',
      ignorePath: '..'
    }))
  .pipe(gulp.dest(yeoman.app + '/views'));
});

///////////
// Build //
///////////

gulp.task('clean:dist', function (cb) {
  rimraf('./../login', cb);
});

gulp.task('client:build', ['html', 'styles','assets'], function () {
  // var jsFilter = $.filter('**/*.js');
  // var jsmapFilter = $.filter('**/*.map');
  // var cssFilter = $.filter('**/*.css');

  return gulp.src(paths.views.main)
    .pipe($.useref({searchPath: [yeoman.app, '.tmp']}))
    // .pipe(jsFilter)
    // .pipe(jsmapFilter)
    //.pipe($.ngAnnotate())
    //.pipe($.uglify())
    // .pipe(jsFilter.restore())
    // .pipe(jsmapFilter.restore())
    // .pipe(cssFilter)
    // .pipe($.minifyCss({cache: true}))
    // .pipe(cssFilter.restore())
    // .pipe(gulpif('*.{js,css,map}', $.rev()))
    // .pipe($.revReplace())
    .pipe(gulp.dest(yeoman.dist));
});

gulp.task('html', function () {
  return gulp.src(yeoman.app + '/views/**/*')
    .pipe(gulp.dest(yeoman.dist + '/views'));
});

gulp.task('copy:images', function () {
  return gulp.src(yeoman.app + '/images/*')
    .pipe(gulp.dest(yeoman.dist + '/images'))
    /*.pipe($.cache($.imagemin({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true
    })));*/
    
});

gulp.task('copy:extras', function () {
  return gulp.src(yeoman.app + '/*/.*', { dot: true })
    .pipe(gulp.dest(yeoman.dist));
});

gulp.task('copy:fonts', function () {
  return gulp.src(yeoman.app + '/fonts/**/*')
    .pipe(gulp.dest(yeoman.dist + '/fonts'));
});
gulp.task('copy:assets', function () {
  return gulp.src(yeoman.app + '/assets/**/*')
    .pipe(gulp.dest(yeoman.dist + '/assets'));
});
gulp.task('build', ['clean:dist'], function () {
  runSequence(['copy:images', 'copy:extras', 'copy:fonts', 'client:build','copy:assets']);
});

gulp.task('default', ['build']);

//----------------------------------------------------BB-------------------------------//

// var gulp = require('gulp');
// var inject = require('gulp-inject');
// var replace = require('gulp-replace-path');
// var concat = require('gulp-concat');
// var uglify = require('gulp-uglify');
// var runSequence = require('run-sequence');

// var env = process.NODE_ENV || 'development';
// var paths = {
//   index: './app/index.html',
//   bower: ['./bower_components'],
//   userAgent: './client/app/services/user-agent.js',
//   js: [
//     '!./client/app/services/user-agent.js',
//     './app/**/*.module.js',
//     './app/script/app.js',
//     './app/**/*.js'
//   ],
//   css: ['!./client/app/update-browser/styles.css', './client/app/**/*.css'],
//   dist: env === 'production' ? './dist' : './client',
//   distLibs: './dist/libs',
//   distFonts: './app/fonts',
//   bowerDirectory: './bower_components'
// };

// var bowerFilePaths = {
//   js: [
//     paths.bowerDirectory + '/jquery/dist/jquery.min.js',
//     paths.bowerDirectory + '/angular/angular.js',
//     paths.bowerDirectory + '/angular-bootstrap/ui-bootstrap-tpls.min.js',
//     paths.bowerDirectory + '/moment/min/moment.min.js',
//     paths.bowerDirectory + '/angular-moment/angular-moment.min.js',
//     paths.bowerDirectory + 'angular-resource/angular-resource.min.js',
//     paths.bowerDirectory + '/angular-cron-jobs/dist/angular-cron-jobs.min.js',
//     paths.bowerDirectory + '/bootstrap-ui-datetime-picker/dist/datetime-picker.min.js',
//     paths.bowerDirectory + '/angular-ui-router/release/angular-ui-router.js',
//     paths.bowerDirectory + '/angular-ui-select/dist/select.js',
//     paths.bowerDirectory + '/angular-ui-switch/angular-ui-switch.min.js',
//     paths.bowerDirectory + '/chartist/dist/chartist.min.js',
//     paths.bowerDirectory + '/angularjs-slider/dist/rzslider.min.js',
//     paths.bowerDirectory + '/angular-ui-select/dist/select.min.js',
//     paths.bowerDirectory + '/x2js/xml2json.js',
//     paths.bowerDirectory + '/angular-x2js/src/x2js.js',
//     paths.bowerDirectory + '/angular-cookie-law/dist/angular-cookie-law.min.js',
//     paths.bowerDirectory + '/angular-smart-table/dist/smart-table.min.js',
//     paths.bowerDirectory + '/lodash/dist/lodash.min.js',
//     paths.bowerDirectory + '/angular-toastr/dist/angular-toastr.tpls.min.js',
//     paths.bowerDirectory + '/ngstorage/ngStorage.min.js',
//     paths.bowerDirectory + '/ng-file-upload/ng-file-upload.js',
//     paths.bowerDirectory + '/slick-carousel/slick/slick.js',
//     paths.bowerDirectory + '/angular-slick-carousel/dist/angular-slick.min.js',
//     paths.bowerDirectory + '/aws-sdk/dist/aws-sdk.js',
//     paths.bowerDirectory + '/ng-tags-input/ng-tags-input.js',
//     paths.bowerDirectory + '/bootstrap-sweetalert/dist/sweetalert.js'
//   ],
//   // css: [
//   //   paths.bowerDirectory + '/bootstrap/dist/css/bootstrap.min.css',
//   //   paths.bowerDirectory + '/components-font-awesome/css/font-awesome.min.css',
//   //   paths.bowerDirectory + '/angular-cron-jobs/dist/angular-cron-jobs.min.css',
//   //   paths.bowerDirectory + '/fullpage.js/dist/jquery.fullpage.min.css',
//   //   paths.bowerDirectory + '/angular-ui-select/dist/select.css',
//   //   paths.bowerDirectory + '/chartist/dist/chartist.min.css',
//   //   paths.bowerDirectory + '/angular-ui-switch/angular-ui-switch.min.css',
//   //   paths.bowerDirectory + '/angularjs-slider/dist/rzslider.min.css',
//   //   paths.bowerDirectory + '/angular-ui-select/dist/select.min.css',
//   //   paths.bowerDirectory + '/angular-cookie-law/dist/angular-cookie-law.min.css',
//   //   paths.bowerDirectory + '/angular-toastr/dist/angular-toastr.min.css',
//   //   paths.bowerDirectory + '/slick-carousel/slick/slick.scss',
//   //   paths.bowerDirectory + '/slick-carousel/slick/slick-theme.scss',
//   //   paths.bowerDirectory + '/ng-tags-input/ng-tags-input.css',
//   //   paths.bowerDirectory + '/bootstrap-sweetalert/dist/sweetalert.css'
//   // ],
//   // fonts: [
//   //   paths.bowerDirectory + '/bootstrap/dist/fonts/glyphicons-halflings-regular.*',
//   //   paths.bowerDirectory + '/font-awesome/fonts/*.*'
//   // ]
// };

// var config = {
//   srcOptions: {
//     read: false
//   },
//   injection: {
//     addRootSlash: false,
//     ignorePath: '/client/'
//   }
// };

// var bundles = {
//   js: [
//     './client/vendor.js',
//     './client/app.bundle.js'
//   ],
//   css: [
//     './client/vendor.css',
//     './client/app.bundle.css'
//   ]
// };

// gulp.task('build-bower-js', function () {
//   return gulp.src(bowerFilePaths.js)
//     .pipe(concat('vendor.js'))
//     .pipe(uglify())
//     .pipe(gulp.dest(paths.dist));
// });

// gulp.task('build-bower-css', function () {
//   return gulp.src(bowerFilePaths.css)
//     .pipe(concat('vendor.css'))
//     .pipe(replace(/..\/fonts/g, 'assets/fonts'))
//     .pipe(gulp.dest(paths.dist));
// });

// gulp.task('build-bower-files', function (callback) {
//   runSequence('build-bower-js', 'build-bower-css', callback);
// });

// gulp.task('build-adraffle-js', function () {
//   return gulp.src(paths.js)
//     .pipe(concat('app.bundle.js'))
//     .pipe(gulp.dest(paths.dist));
// });

// gulp.task('build-adraffle-css', function () {
//   return gulp.src(paths.css)
//     .pipe(concat('app.bundle.css'))
//     .pipe(gulp.dest(paths.dist));
// });

// gulp.task('build-adraffle-files', function (callback) {
//   runSequence('build-adraffle-js', 'build-adraffle-css', callback);
// });

// gulp.task('fonts', function () {
//   return gulp.src(bowerFilePaths.fonts)
//     .pipe(gulp.dest(paths.distFonts));
// });

// gulp.task('inject-adraffle', function () {
//   gulp.src(paths.index)
//   // Inject bundled js files
//     .pipe(inject(gulp.src(bundles.js, config.srcOptions), config.injection))

//     // Inject bundled css files
//     .pipe(inject(gulp.src(bundles.css, config.srcOptions), config.injection))

//     // Destination
//     .pipe(gulp.dest(paths.dist));
// });

// gulp.task('bundle', function (callback) {
//   runSequence('build-bower-files', 'build-adraffle-files', 'fonts', callback);
// });

// gulp.task('serve', runSequence('bundle', 'inject-adraffle'), function (callback) {
//   gulp.watch(paths.js, ['build-adraffle-js']);
//   gulp.watch(paths.css, ['build-adraffle-css']);
// });
