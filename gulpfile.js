var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('sass', function () {
  return gulp.src('client/new/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./client/new/css/'));
});

gulp.task('default', function () {
  gulp.watch('client/new/scss/**/*.scss', ['sass']);
});