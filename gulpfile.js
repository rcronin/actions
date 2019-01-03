const gulp = require('gulp');

gulp.task('copy', (done) => {
    gulp.src(['src/actions/**/*.png'])
        .pipe(gulp.dest('lib/actions/'));

    done();
});