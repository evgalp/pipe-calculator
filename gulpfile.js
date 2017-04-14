var gulp = require('gulp'), // Подключаем Gulp
    less = require('gulp-less'), //Подключаем less пакет,
    browserSync = require('browser-sync'), // Подключаем Browser Sync
    concat = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
    uglify = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
    autoprefixer = require('gulp-autoprefixer');
    del = require('del');


gulp.task('less', function(){ // Создаем таск less
    return gulp.src('less/**/*.less') // Берем источник
        .pipe(less()) // Преобразуем less в CSS посредством gulp-less
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
        .pipe(gulp.dest('css')) // Выгружаем результата в папку css
        .pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
    browserSync({ // Выполняем browserSync
        server: { // Определяем параметры сервера
            baseDir: '' // Директория для сервера - app
        },
        notify: false // Отключаем уведомления
    });
});

gulp.task('scripts', function() {
    return gulp.src([ // Берем все необходимые библиотеки
        // 'libs/jquery/dist/main.js'
        ])
        .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('js')); // Выгружаем в папку js
});

gulp.task('watch', ['browser-sync', 'less'], function() {
    gulp.watch('less/**/*.less', ['less']); // Наблюдение за less файлами в папке less
    gulp.watch('*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
    gulp.watch('js/**/*.js', browserSync.reload); // Наблюдение за JS файлами в папке js
});

gulp.task('default', ['watch']);