const gulp = require('gulp');
const del = require('del');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const cssmin = require('gulp-minify-css');
const sass = require('gulp-sass');
const browserSync = require('browser-sync');
const reload=browserSync.reload;

const paths = {
    app:{
        js:'./app/js',
        js_view:'./app/js/view/*.js',
        js_bundle:'./app/js/*.js',
        css:'./app/css',
        css_bundle:'./app/css/*.css'
    },
    src:{
        js_common:[
            './src/script/common/global.js',
            './src/script/common/main.js',
            './src/script/common/render.*.js',
            './src/script/common/config.js'
        ],
        js_vendor:['./src/script/vendor/*.js'],
        css_router:'./src/style/router.scss',
        css_source:'./src/style/*'
    }
}
gulp.task('default', gulp.series(
    clean, 
    gulp.parallel(concat_js_common, concat_js_vendor, concat_css),
    gulp.parallel(browser_sync,watch)
));
gulp.task('build', gulp.series(
    clean, 
    gulp.parallel(concat_js_common, concat_js_vendor, concat_css),
    gulp.parallel(compress_js,compress_css)
));
function clean(){
    return del([
        paths.app.js_bundle,
        paths.app.css_bundle
    ]);
}
//contact js
function concat_js_common() {
    return gulp.src(paths.src.js_common)
        .pipe(concat('common.js'))
        .pipe(gulp.dest(paths.app.js));
}
function concat_js_vendor() {
    return gulp.src(paths.src.js_vendor)
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest(paths.app.js));
}
//contact css
function concat_css(){
    return gulp.src(paths.src.css_router)
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(rename('style.css'))
        .pipe(gulp.dest(paths.app.css));
}
//compress
function compress_js(){
    return gulp.src(paths.app.js_bundle)
        .pipe(uglify())
        .pipe(gulp.dest(paths.app.js));
}
function compress_css(){
    return gulp.src(paths.app.css_bundle)
        .pipe(cssmin())
        .pipe(gulp.dest(paths.app.css));
}
//watch
function watch(){
    gulp.watch(paths.src.js_common, concat_js_common);
    gulp.watch(paths.src.js_vendor, concat_js_vendor);
    gulp.watch(paths.src.css_source, concat_css);
}
//browsersync
function browser_sync(){
    browserSync({
        server: {
            index:'index.html'
        },
        port: 3000,
        ui: {
            port: 3001
        },
        open:false
    });
    gulp.watch(paths.app.js_view).on('change',reload);
}


const winrar = require('./src/script/gulp/winrar');
const argv = require('minimist')(process.argv.slice(2));

gulp.task('ds',decompress);
function decompress(cb){
    gulp.src('./app/js/data/*.json')
    .pipe(winrar("decrypt",argv.pw))
    .pipe(gulp.dest('./app/js/dataTemplate/'));
    cb();
}

gulp.task('cs',gulp.series(compress,dataClean));
function compress(cb){
    gulp.src('./app/js/dataTemplate/*.json')
    .pipe(winrar("encrypt",argv.pw))
    .pipe(gulp.dest('./app/js/data/'));
    cb();
}

gulp.task('clean',dataClean);
function dataClean(){
    return del('./app/js/dataTemplate');
}