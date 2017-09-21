// *************************************
//
//   Gulpfile
//
// *************************************
//
// Available tasks:
//   `gulp`
//   `gulp browserSync`
//   `gulp jekyll`
//   `gulp sass`
//   `gulp scripts`
//   `gulp images`
//   `gulp cache:clear`
//   `gulp watch`
//
// *************************************

'use strict';

// -------------------------------------
//   Modules
// -------------------------------------
//
// gulp              	: The streaming build system
// gulp-sass         	: Compile Sass
// gulp-autoprefixer 	: Prefix CSS
// browser-sync			: Autorefresh page upon file change
// gulp-uglify       	: Minify JavaScript with UglifyJS
// gulp-cssnano			: Minify CSS files
// gulp-imagemin		: Optimize images for web
// gulp-cache			: Cache optimized images
// run-sequence      	: Run a series of dependent Gulp tasks in order
// gulp-util         	: Utility functions
// gulp-concat       	: Concatenate files
//
// -------------------------------------

var argv         	= require( 'minimist' )(process.argv.slice(2));
var gulp 			= require( 'gulp' );
var gulpIf 			= require( 'gulp-if' );
var sass 			= require( 'gulp-sass' );
var prefixer		= require( 'gulp-autoprefixer' );	
var browserSync 	= require( 'browser-sync' ).create();
var uglify 			= require( 'gulp-uglify' );
var lazypipe     	= require( 'lazypipe' );
var plumber      	= require( 'gulp-plumber' );
var rev          	= require( 'gulp-rev' );
var revReplace		= require( 'gulp-rev-replace' );
var header			= require( 'gulp-header' );
var cssnano 		= require( 'gulp-cssnano' );
var imagemin 		= require( 'gulp-imagemin' );
var cache 			= require( 'gulp-cache' );
var runSeq			= require( 'run-sequence' );
var flatten     	= require( 'gulp-flatten' );
var gutil			= require( 'gulp-util' );
var concat 			= require( 'gulp-concat' );
var merge        	= require( 'merge-stream' );
var wiredep 		= require( 'wiredep' );
var sourcemaps   	= require( 'gulp-sourcemaps' );
var runSequence 	= require( 'run-sequence' );
var changed      	= require( 'gulp-changed' );
var manifest 		= require( 'asset-builder' )( './assets/manifest.json' );

// -------------------------------------
//   Config
// -------------------------------------

var path = manifest.paths;
var config = manifest.config || {};
var globs = manifest.globs;
var project = manifest.getProjectGlobs();

var enabled = {
	cdn: argv.production,
	// Enable static asset revisioning when `--production`
	rev: argv.production,
	// Disable source maps when `--production`
	maps: !argv.production,
	// Fail styles task on error when `--production`
	failStyleTask: argv.production,
	// Fail due to JSHint warnings only when `--production`
	failJSHint: argv.production,
	// Strip debug statments from javascript when `--production`
	stripJSDebug: argv.production
};

// Path to the compiled assets manifest in the dist directory
var revManifest = path.dist + 'assets.json';

var writeToManifest = function(directory) {
  return lazypipe()
    .pipe(gulp.dest, path.dist + directory)
    .pipe(browserSync.stream, {match: '**/*.{js,css}'})
    .pipe(rev.manifest, revManifest, {
      base: path.dist,
      merge: true
    })
    .pipe(gulp.dest, path.dist)();
};

// -------------------------------------
//   Task: BrowserSync
// -------------------------------------

gulp.task( 'browserSync', function() {
	browserSync.init({
		files: [config.jekyllPath + '/_site/**'],
		server: {
			baseDir: config.jekyllPath + '/_site'
		}
	})
});


// -------------------------------------
//   Task: Jekyll
// -------------------------------------

function parseHashString(filename) {
	var hash = filename;
	if (hash.indexOf('.css') > -1) {
		hash = hash.replace('.css', '');
	}
	if (hash.indexOf('.js') > -1) {
		hash = hash.replace('.js', '');
	}
	if (hash.indexOf('main-') > -1) {
		hash = hash.replace('main-', '');
	}
	return hash;
}

gulp.task( 'jekyll', function (callback) {
    var spawn = require( 'child_process' ).spawn;
    var args = ['build'];  
    if (!argv.production) {
    	args.push('--watch', '--incremental', '--drafts', '--config', '_config.yml,_local_config.yml');
    } else {
    	args.push('JEKYLL_ENV=production');
    }
    var jekyll = spawn( 'jekyll', args, { cwd: config.jekyllPath } );

    var jekylllogger = function (buffer) {
    	buffer.toString().split(/\n/).forEach( function (message) {
    		gutil.log( 'Jekyll: ' + message );
    	});
    };

    jekyll.stdout.on( 'data', jekylllogger );
    jekyll.stderr.on( 'data', jekylllogger );
    jekyll.on( 'exit', function() {
    	browserSync.reload();
    });
});


// -------------------------------------
//   Task: Sass
// -------------------------------------

var cssTasks = function(filename) {
	return lazypipe()
		.pipe(function() {
	      	return gulpIf(!enabled.failStyleTask, plumber());
	    })
		.pipe(function() {
	      	return gulpIf(enabled.maps, sourcemaps.init());
	    })		
	    .pipe(function() {
			return gulpIf(enabled.cdn, 
				header('$cdnurl: "https://d280tyru8g19x6.cloudfront.net";'),
				header('$cdnurl: "";')
			);
		})
		.pipe(function() {
			return gulpIf('*.scss', sass({
				outputStyle: 'compressed', 
				precision: 10,
		        includePaths: ['.'],
		        errLogToConsole: !enabled.failStyleTask
			}));
		})
		.pipe( concat, filename )
		.pipe( prefixer, { browsers: ['last 2 versions'] })
		.pipe( cssnano, { safe: true })
		.pipe(function() {
	      return gulpIf(enabled.rev, rev());
	    })
		.pipe(function() {
	      	return gulpIf(enabled.maps, sourcemaps.write());
	    })();
};

gulp.task('styles', ['wiredep'], function() {
  	var merged = merge();
  	manifest.forEachDependency('css', function(dep) {
	    var cssTasksInstance = cssTasks(dep.name);
	    if (!enabled.failStyleTask) {
	      	cssTasksInstance.on('error', function(err) {
		        console.error(err.message);
		        this.emit('end');
	      	});
	    }
    	merged.add(gulp.src(dep.globs, {base: 'scss'})
      		.pipe(cssTasksInstance));
  	});
  	return merged.pipe(writeToManifest('styles'));
});


// -------------------------------------
//   Task: Scripts
// -------------------------------------

var jsTasks = function(filename) {
	return lazypipe()
	  	.pipe(function() {
	      	return gulpIf(enabled.maps, sourcemaps.init());
	    })
	    .pipe(concat, filename)
	    .pipe(uglify, {
	      	compress: {
	        	'drop_debugger': enabled.stripJSDebug
	      	}
	    })
	    .pipe(function() {
	      	return gulpIf(enabled.rev, rev());
	    })	
	    .pipe(function() {
	      	return gulpIf(enabled.maps, sourcemaps.write());
	    })();
};

gulp.task('scripts', function() {
	var merged = merge();
	manifest.forEachDependency('js', function(dep) {
	    merged.add(
	      	gulp.src(dep.globs, {base: 'js'})
	        	.pipe(jsTasks(dep.name))
	    );
	});
	return merged.pipe(writeToManifest('scripts'));
});

// -------------------------------------
//   Task: Fonts
// -------------------------------------

gulp.task('fonts', function() {
  	return gulp.src(globs.fonts)
    	.pipe(flatten())
    	.pipe(gulp.dest(path.dist + 'fonts'))
    	.pipe(browserSync.stream());
});

// -------------------------------------
//   Task: Images
// -------------------------------------

gulp.task( 'images', function() {
	return gulp.src(globs.images)
		.pipe( cache( imagemin({
			progressive: false,
			interlaced: true
		})))
		.pipe(gulp.dest(path.dist + 'images'));
});


// -------------------------------------
//   Task: Wiredep
// -------------------------------------

gulp.task('wiredep', function() {
	var wiredep = require('wiredep').stream;
	return gulp.src(project.css)
	    .pipe(wiredep())
	    .pipe(changed(path.source + 'scss', {
	      hasChanged: changed.compareSha1Digest
	    }))
	    .pipe(gulp.dest(path.source + 'scss'));
});


// -------------------------------------
//   Task: Cache:clear
// -------------------------------------

gulp.task( 'cache:clear', function (callback) {
	return cache.clearAll( callback );
})


// -------------------------------------
//   Task: Clean
// -------------------------------------

gulp.task( 'clean', require('del').bind(null, [path.dist]));

// -------------------------------------
//   Task: Watch
// -------------------------------------

gulp.task( 'watch', ['browserSync'], function() {
	gulp.watch([path.source + 'scss/**/*'], ['styles']);
  	gulp.watch([path.source + 'js/**/*'], ['scripts']);
  	gulp.watch([path.source + 'fonts/**/*'], ['fonts']);
  	gulp.watch([path.source + 'images/**/*'], ['images']);
  	gulp.watch(['bower.json', 'assets/manifest.json'], ['build']);
});


// -------------------------------------
//   Task: Build
// -------------------------------------

gulp.task( 'build', function(callback) {
  	runSequence( 'styles', 'scripts', ['fonts', 'images'], callback );
});


// -------------------------------------
//   Task: Default
// -------------------------------------

gulp.task( 'default', ['clean'], function() {
  	gulp.start('build');
});

