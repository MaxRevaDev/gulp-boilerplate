const {series, parallel, src, dest, watch} = require('gulp')

const sass = require('gulp-sass')
const sassGlob = require('gulp-sass-glob')
const autoprefixer = require('gulp-autoprefixer')

// const del = require('del')
const browserSync = require('browser-sync').create()

const plumber = require('gulp-plumber')
const pug = require('gulp-pug')

const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const concat = require('gulp-concat')
const babel = require('gulp-babel')


const paths = {
  pug: {
    src: './src/pug/*.pug',
    watch: './src/pug/**/*.pug'
  },
  styles: ['./src/scss/**/*.scss'],
  scripts: ['./src/js/*.js'],
  images: [
    './src/images/**/*.svg',
    './src/images/**/*.png',
    './src/images/**/*.jpg',
    './src/images/**/*.gif',
    './src/images/**/*.jpeg'
  ],
  fonts: ['./src/fonts/**/*.*']
};

// ========================================
// -- HTML compiling
// ========================================
function pug2html() {
  return src(paths.pug.src)
    .pipe(plumber())
    .pipe(pug({
      pretty: true
    }))
    .pipe(plumber.stop())
    .pipe(dest('./dist'))
    .pipe(browserSync.stream());
}

// ========================================
// -- Sass
// ========================================
function styles() {
  return src(paths.styles)
    .pipe(sassGlob())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(autoprefixer({browsers: ['last 15 versions'], cascade: false}))
    .pipe(rename('style.min.css'))
    .pipe(dest('./dist/css/'))
    .pipe(browserSync.stream());
}

// ========================================
// -- Scripts
// ========================================
function js() {
  return src(paths.scripts)
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(concat('app.js'))
    .pipe(uglify())
    .on('error', function errorHandler(error) {
      console.log(error.toString());
      this.emit('end');
    })
    .pipe(rename('app.min.js'))
    .pipe(dest('./dist/js/'))
    .pipe(browserSync.stream());
}

// ========================================
// -- Images
// ========================================
function img() {
  return src(paths.images)
    .pipe(dest('./dist/images/'))
    .pipe(browserSync.stream());
}

// ========================================
// -- Fonts
// ========================================
function fonts() {
  return src(paths.fonts)
    .pipe(dest('./public/fonts_iax/'))
    .pipe(browserSync.stream())
}

// ========================================
// -- Static server
// ========================================
function serve(callback) {
  browserSync.init({
    port: 8100,
    server: './dist/',
    ghostMode: false
  });
  callback()
}

// ========================================
// -- File watching
// ========================================
function watchFiles() {
  watch(paths.images, img)
  watch(paths.scripts, js)
  watch(paths.styles, styles)
  watch(paths.pug.watch, pug2html)
}

exports.build = parallel(pug2html, styles, js, img)
exports.default = series(parallel(pug2html, styles, js, img), serve, watchFiles)
