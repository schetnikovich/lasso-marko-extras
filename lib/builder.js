var async = require('async');
var path = require('path');
var lasso = require('lasso');
var logger = require('raptor-logging').logger(module);
var rimraf = require('rimraf');

exports.build = build;

/**
 * build({
 *   baseDir: __dirname,
 *   files: ['file1.ico', '../file2.gif'],
 *   pages: ['./path/to/page1', './page2'],
 *   force: true      // Force removal of cache and output folders (default: true)
 * })
 *
 * @param config Config object
 * @param callback(err) Optional callback
 */
function build(config, callback) {
  var baseDir = config.baseDir || process.cwd();
  var files = config.files || [];
  var pages = config.pages || [];
  var force = config.force === undefined ? true : config.force;

  prepare(force, function(err) {
    if (err) {
      if (callback) { callback(err); }
      return;
    }

    buildFiles(baseDir, files, function(err) {
      if (err) {
        if (callback) { callback(err); }
        return;
      }

      logger.info('Files processed!');
      buildPages(baseDir, pages, function(err) {
        if (err) {
          if (callback) { callback(err); }
          return;
        }

        logger.info('Build complete!');
        if (callback) { callback(null); }
      });
    });
  });
}

// ---------------------------
// Building of files and pages
// ---------------------------

/**
 * @param force Force deletion of cache and output folder
 * @param callback
 */
function prepare(force, callback) {
  if (!force) {
    logger.info('Cleanup of cache and output folder is not performed.');
    callback(null);
    return;
  }

  // Find cache directory
  var defaultCacheDir = path.join(require('app-root-dir').get(), '.cache/lasso');
  var cacheDir = lasso.getDefaultLasso().getConfig().getCacheDir() || defaultCacheDir;

  // Find output directory where assets are located
  var outputDir = lasso.getDefaultLasso().getConfig().outputDir;

  // Delete cache and output folders
  rimraf(cacheDir, function(err) {
    if (err) {
      callback(err);
      return;
    }

    logger.info('Folder ' + cacheDir + ' removed');
    rimraf(outputDir, function(err) {
      if (err) {
        callback(err);
        return;
      }

      logger.info('Folder ' + outputDir + ' removed');
      callback(null);
    });
  });
}

function buildFiles(prefix, files, callback) {
  async.eachSeries(files, function(file, callback) {
    lasso.lassoResource(path.join(prefix, file), function(err) {
      if (err) {
        logger.info('Failed to process file: ', err);
        callback(err);
        return;
      }

      logger.info('File "' + file + '" processed.');
      callback(null);
    });

  }, function(err) {
    if (err) {
      callback(err);
      return;
    }

    callback();
  });
}

function buildPages(prefix, pages, callback) {
  async.eachSeries(pages, function(page, callback) {

    var from = path.join(prefix, page);
    var pagePath = path.join(from, 'page.json');

    var config = {};
    if (require('fs').existsSync(pagePath)) {
      config = require(pagePath);
    }

    config.from = from;

    if (!config.name) {
      config.name = path.basename(page);
    }

    if (!config.packagePath) {
      // Look for an browser.json in the same directory
      config.packagePath = path.join(from, 'browser.json');
    }

    if (!config.cacheKey) {
      // Filename of the compiled template is the default cache key
      config.cacheKey = path.join(from, 'template.marko.js');
    }

    lasso.lassoPage(config,
      function(err) {
        if (err) {
          logger.info('Failed to lasso page: ', err);
          callback(err);
          return;
        }

        logger.info('Page "' + page + '" processed.');
        callback(null);
      }
    );

  }, function(err) {
    if (err) {
      callback(err);
      return;
    }

    callback();
  });
}
