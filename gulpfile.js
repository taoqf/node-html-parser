const gulp = require('gulp');
const shell = require('gulp-shell');
const sequence = require('gulp-sequence');

gulp.task('clean', () => {
	const del = require('del');
	return del('./dist/');
});

gulp.task('compile-ts', shell.task('tsc -m commonjs'));

gulp.task('compile-ts-umd', shell.task('tsc -t es5 -m umd --outDir ./dist/umd/'));

gulp.task('watch-ts', shell.task('tsc -w -t es5 -m umd --outDir ./dist/umd/'));

gulp.task('default', gulp.series('clean', 'compile-ts', 'compile-ts-umd'));

gulp.task('dev', gulp.series('watch-ts'));
