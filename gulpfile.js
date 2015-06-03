var gulp  = require('gulp');
var react = require('gulp-react');
var concat = require('gulp-concat');

gulp.task('react', function () {
  return gulp.src('components/**')
    .pipe(concat('components.js'))
    .pipe(react())
    .pipe(gulp.dest('public/js/'));
});

gulp.task('default', ['react']);
