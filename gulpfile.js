const gulp = require('gulp');

gulp.task('copy', () => {
    return gulp.src(['src/actions/**/*.png'])
        .pipe(gulp.dest('lib/actions/'));
});