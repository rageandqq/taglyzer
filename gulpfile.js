var gulp  = require('gulp');
var react = require('gulp-react');
var concat = require('gulp-concat');
var wiredep = require('wiredep').stream;

gulp.task('react', function () {
  return gulp.src('components/**')
    .pipe(concat('components.js'))
    .pipe(react())
    .pipe(gulp.dest('public/js/'));
});

gulp.task('react-debug', function() {
  gulp.src('components/**')
    .pipe(react())
});

gulp.task('default', ['react', 'wiredep']);

gulp.task('wiredep', function () {
    gulp.src('views/main.html')
    .pipe(wiredep())
    .pipe(gulp.dest('views'));
});
