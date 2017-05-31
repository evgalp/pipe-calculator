var gulp       = require('gulp'), 
	less         = require('gulp-less'), 
	browserSync  = require('browser-sync'),
	concat       = require('gulp-concat'), 
	uglify       = require('gulp-uglifyjs'), 
	cssnano      = require('gulp-cssnano'),
	rename       = require('gulp-rename'),
	del          = require('del'),
	cache        = require('gulp-cache'),
	autoprefixer = require('gulp-autoprefixer');

gulp.task('less', function(){
	return gulp.src('less/**/*.less') 
		.pipe(less()) 
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) 
		.pipe(cssnano()) 
		.pipe(rename({suffix: '.min'})) 
		.pipe(gulp.dest('css')) 
		.pipe(browserSync.reload({stream: true}))
});

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: ''
		},
		notify: false
	});
});

gulp.task('concat-libs', function() {
	return gulp.src([
		'js/libs/jquery-2.2.4.min.js',
		'js/libs/jquery.validate.min.js',
		'js/libs/validator_messages_uk.js',
		'js/libs/uikit.min.js',
		'js/libs/uikit-icons.min.js',
		'js/libs/scroll-top.js'
		])
	.pipe(concat('libs.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('js'));
});

gulp.task('concat-calc', function() {
	return gulp.src([
		'js/calc/calc.js',
		'js/calc/validationRules.js'
		])
	.pipe(concat('calc.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('js'));
});

gulp.task('watch', ['browser-sync', 'less', 'concat-libs', 'concat-calc'], function() {
	gulp.watch('less/**/*.less', ['less']);
	gulp.watch('*.html', browserSync.reload);
	gulp.watch('js/libs/*.js', function(){
		gulp.start('concat-libs');
	});
	gulp.watch('js/calc/*.js', function(){
		gulp.start('concat-calc');
	});
	gulp.watch('js/*.js', browserSync.reload)
});

gulp.task('clean', function() {
	return del.sync('dist');
});

gulp.task('default', ['watch']);
