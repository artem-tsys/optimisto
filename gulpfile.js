const gulp = require('gulp')
const pug = require('gulp-pug')
const rename = require('gulp-rename')
const del = require('del')
const notify = require('gulp-notify')
const plumber = require('gulp-plumber')
const browserSync = require('browser-sync').create()
// css
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')
const autoprefixer = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')
const gulpStylelint = require('gulp-stylelint')
// webpack
// const gulpWebpack = require('gulp-webpack');
// const webpack = require('webpack');
// const webpackConfig = require('./webpack.config.js');
// js
const importFile = require('gulp-file-include')
const terser = require('gulp-terser')
const babel = require('gulp-babel')
const eslint = require('gulp-eslint')
// const uglify = require('gulp-uglify');
// img
const cache = require('gulp-cache')
const imagemin = require('gulp-imagemin')
const imageminJpegRecompress = require('imagemin-jpeg-recompress')
const imageminPngquant = require('imagemin-pngquant')
// svg
const svgSprites = require('gulp-svg-sprites')

const paths = {
	root: './wp-content/themes/optimisto',
	templates: {
		pages: ['./src/pug/pages/*.pug', './src/pug/pages/includes/*.pug'],
		src: './src/pug/**/*.pug',
		dest: './wp-content/themes/optimisto',
	},
	styles: {
		main: './src/assets/s3d/styles/main.scss',
		src: ['./src/assets/s3d/styles/**/*.scss', './src/assets/s3d/styles/**/*.css'],
		dest: './wp-content/themes/optimisto/assets/s3d/styles',
	},
	scripts: {
		src: './src/assets/s3d/scripts/**/*.js',
		dest: './wp-content/themes/optimisto/assets/s3d/scripts/',
	},
	fonts: {
		src: './src/assets/fonts/**/*',
		dest: './wp-content/themes/optimisto/assets/fonts',
	},
	images: {
		src: './src/assets/s3d/images/**/*',
		dest: './wp-content/themes/optimisto/assets/s3d/images',
	},
	svgSprite: {
		src: './src/assets/s3d/svg-sprite/*.svg',
		dest: './src/assets/s3d/svg-sprite/sprite/',
	},
	gulpModules: {
		src: './src/assets/s3d/scripts/gulp-modules/*.js',
		dest: './wp-content/themes/optimisto/assets/s3d/scripts/',
	},
	libs: {
		src: './src/assets/s3d/scripts/libs/libs.js',
		dest: './src/assets/s3d/scripts/gulp-modules/',
	},
	static: {
		src: './src/static/**/*.*',
		dest: './wp-content/themes/optimisto/static/',
	},

	json: {
		src: './src/assets/s3d/*.json',
		dest: './wp-content/themes/optimisto/assets/s3d/',
	},
}

// слежка
function watch() {
	gulp.watch(paths.styles.src, styles)
	gulp.watch(paths.templates.src, templates)
	// gulp.watch(paths.scripts.src, scripts); //for webpack
	gulp.watch(paths.gulpModules.src, gulpModules)
	gulp.watch(paths.images.src, images)
	gulp.watch(paths.fonts.src, fonts)
	gulp.watch(paths.libs.src, libs)
	gulp.watch('./src/assets/s3d/scripts/libs/*.js', libs)
	gulp.watch(paths.static.src, staticFolder)
	gulp.watch('./src/pug/**/*.html', templates)
	gulp.watch('./src/assets/s3d/svg-sprite/*.*', svgSprite)
}

// следим за build и релоадим браузер
function server() {
	browserSync.init({
		// server: paths.root,
		notify: false,
		proxy: 'optimisto3Dmodule',
	})
	browserSync.watch(`${paths.root}/**/*.*`, browserSync.reload)
}

// очистка
function clean() {
	return del(paths.root)
}

// pug
function templates() {
	return gulp.src(paths.templates.pages)
		.pipe(pug({ pretty: true }))
		.pipe(gulp.dest(paths.root))
}

// scss
function styles() {
	return gulp.src(paths.styles.main)
		.pipe(sourcemaps.init()) // инциализация sourcemap'ов
		.pipe(sass({
			outputStyle: 'expanded', // компиляции в CSS с отступами
		}))
		.on('error', notify.onError({
			title: 'SCSS',
			message: '<%= error.message %>', // вывод сообщения об ошибке
		}))
		.pipe(autoprefixer({
			cascade: false,
		}))
		.pipe(sourcemaps.write())
		.pipe(rename('3d.min.css'))
		.pipe(gulp.dest(paths.styles.dest))
}

// fonts
function fonts() {
	return gulp.src(paths.fonts.src)
		.pipe(gulp.dest(paths.fonts.dest))
}

// php
function staticFolder() {
	return gulp.src(paths.static.src)
		.pipe(gulp.dest(paths.static.dest))
}

function json() {
	return gulp.src(paths.json.src)
		.pipe(gulp.dest(paths.json.dest))
}

// svg-sprite
function svgSprite() {
	return gulp.src(paths.svgSprite.src)
		.pipe(svgSprites({
			mode: 'symbols',
			preview: false,
			selector: 'icon-%f',
			svg: {
				symbols: 'symbol_sprite.php',
			},
		}))
		.pipe(gulp.dest(paths.svgSprite.dest))
}

// images
function images() {
	return gulp.src(paths.images.src)
		.pipe(gulp.dest(paths.images.dest))
}

gulp.task('clear', () => cache.clearAll());

// webpack
// function scripts() {
//     return gulp.src(paths.scripts.src)
// 		.pipe(sourcemaps.init())
// 		.pipe(terser())
//         // .pipe(gulpWebpack(webpackConfig), webpack)
// 		.pipe(sourcemaps.write("./"))
//         .pipe(gulp.dest(paths.scripts.dest));
// }

// lint
function esLint() {
	return gulp.src(['src/assets/scripts/**/*.js', 'src/assets/scripts/gulp-modules/*.js', '!node_modules/**', '!src/assets/s3d/scripts/**/libs.js'])
	// eslint() attaches the lint output to the "eslint" property
	// of the file object so it can be used by other modules.
	// 	.pipe(eslint())
		.pipe(eslint({ configFile: '.eslintrc' }))
		// eslint.format() outputs the lint results to the console.
		// Alternatively use eslint.formatEach() (see Docs).
		.pipe(eslint.format())
		// To have the process exit with an error code (1) on
		// lint error, return the stream and pipe to failAfterError last.
		// .pipe(eslint.failAfterError());
}

// gulp-scripts
function gulpModules() {
	return gulp.src(paths.gulpModules.src)
		.pipe(sourcemaps.init())
		// .pipe(terser())
		.pipe(terser({
			keep_fnames: true,
			mangle: false,
		}))
		.pipe(sourcemaps.write('./'))
	// .pipe(plumber({
	//     errorHandler: notify.onError({
	//     title: 'JavaScript',
	//     message: '<%= error.message %>' // выводим сообщение об ошибке
	//     })
	// }))
	// .pipe(importFile({ //
	//  prefix: '@@', // импортим все файлы, описанные в результируещем js
	// basepath: '@file' //
		// }))
		.pipe(gulp.dest(paths.gulpModules.dest))
}
// libs-scripts
function libs() {
	return gulp.src(paths.libs.src)
		.pipe(sourcemaps.init())
		.pipe(importFile({ //
			prefix: '@@', // импортим все файлы, описанные в результируещем js
			basepath: '@file',
		}))
		.pipe(babel({
			presets: ['@babel/env'],
		}))
		.pipe(terser())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.libs.dest))
}

exports.templates = templates
exports.styles = styles
// exports.cssLinter = cssLinter
exports.esLint = esLint
// exports.scripts = scripts;
exports.gulpModules = gulpModules
exports.images = images
exports.clean = clean
exports.fonts = fonts
exports.svgSprite = svgSprite
exports.libs = libs
exports.staticFolder = staticFolder
exports.json = json

gulp.task('default', gulp.series(
	svgSprite,
	clean,
	esLint,
	libs,
	// gulp.parallel(styles, templates, fonts, scripts, images, static, json),
	gulp.parallel(styles, templates, fonts, gulpModules, images, staticFolder, json),
	gulp.parallel(watch, server),
))

// -- BUILD PRODUCTION
const pathsProd = {
	root: './prod',
	templates: {
		src: './dist/*.html',
		dest: './prod',
	},
	style: {
		src: './dist/assets/s3d/styles/*.css',
		dest: './prod/assets/s3d/styles',
	},
	js: {
		src: './dist/assets/s3d/scripts/*.js',
		dest: './prod/assets/s3d/scripts',
	},
	fonts: {
		src: './dist/assets/s3d/fonts/**/*',
		dest: './prod/assets/s3d/fonts',
	},
	static: {
		src: './dist/static/**/*.*',
		dest: './prod/static/',
	},
	images: {
		src: './dist/assets/s3d/images/**/*',
		dest: './prod/assets/s3d/images',
	},
}
// CLEAN PROD FOLDER
function _clean() {
	return del(pathsProd.root)
}
// HTML
function _templates() {
	return gulp.src(pathsProd.templates.src)
		.pipe(gulp.dest(pathsProd.root))
}
// CSS
function _styles() {
	return gulp.src(pathsProd.style.src)
		.pipe(autoprefixer({
			cascade: false,
		}))
		.pipe(cleanCSS())
		.pipe(gulp.dest(pathsProd.style.dest))
}

// FONTS
function _fonts() {
	return gulp.src(pathsProd.fonts.src)
		.pipe(gulp.dest(pathsProd.fonts.dest))
}

// PHP
function _static() {
	return gulp.src(pathsProd.static.src)
		.pipe(gulp.dest(pathsProd.static.dest))
}
// JS
function _scripts() {
	return gulp.src(pathsProd.js.src)
		.pipe(gulp.dest(pathsProd.js.dest))
}
// IMG
function _images() {
	return gulp.src(pathsProd.images.src)
		.pipe(cache(imagemin([
			imagemin.gifsicle({
				interlaced: true,
			}),
			imagemin.jpegtran({
				progressive: true,
			}),
			imageminJpegRecompress({
				loops: 5,
				min: 85,
				max: 95,
				quality: 'high',
			}),
			imagemin.svgo(),
			imagemin.optipng(),
			imageminPngquant({
				quality: [0.85, 0.90],
				speed: 5,
			}),
		], {
			verbose: true,
		})))
		.pipe(gulp.dest(pathsProd.images.dest))
}

exports._templates = _templates
exports._fonts = _fonts
exports._static = _static
exports._clean = _clean
exports._scripts = _scripts
exports._styles = _styles
exports._images = _images

gulp.task('prod', gulp.series(
	_clean,
	gulp.parallel(_templates, _fonts, _static, _scripts, _styles, _images),
))
