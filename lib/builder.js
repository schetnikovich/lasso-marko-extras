var async = require('async');
var path = require('path');
var fs = require('fs');
var lasso = require('lasso');
var logger = require('raptor-logging').logger(module);
var rimraf = require('rimraf');
var compiler = require('./compiler');

exports.build = build;

/**
 * This function performs all Lasso- and Marko-related preparations to
 * make site ready for production deployment.
 *
 * All paths are relative to "baseDir" directory, or to "process.cwd()" if
 * "baseDir" is not specified.
 *
 * build({
 *   baseDir: __dirname,
 *   files: ['file1.ico', '../file2.gif'],    // Paths to files
 *   pages: ['./path/to/page1', './page2'],   // Paths to page directories.
 *   force: true                              // Force removal of cache and output
 *                                            //   folders (default: true).
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

  compiler.compile(force, function (err) {
    if (err) {
      if (callback) { callback(err); }
      return;
    }

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
    if (!page.endsWith('.marko')) {
      page = path.join(page, 'template.marko'); // default name of the template
    }

    var templatePath = path.join(prefix, page);                 // sample: /path/to/template.marko
    var templateFolderPath = path.dirname(templatePath);        // sample: /path/to
    var templateFolderName = path.basename(templateFolderPath); // sample: to
    var template = require(templatePath);

    var pagePath = path.join(templateFolderPath, 'page.json');

    var config = {};
    if (require('fs').existsSync(pagePath)) {
      config = require(pagePath);
    }

    config.from = templateFolderPath;

    if (!config.name) {
      config.name = templateFolderName;
    }

    if (!config.pageName) {
      config.pageName = templateFolderName;
    }

    if (!config.cacheKey) {
      // Filename of the compiled template is the default cache key (i.e. template.marko.js)
      config.cacheKey = template.path;
    }

    if (!config.cache) {
      config.cache = true;
    }

    var packagePath = config.packagePath ?
      config.packagePath :
      path.join(templateFolderPath, 'browser.json');

    var dependencies = template.getDependencies ? template.getDependencies() : [];
    if (fs.existsSync(packagePath)) {
      dependencies.push({ type: 'package', path: packagePath });
    }

    config.dependencies = dependencies;
    config.dirname = path.dirname(template.path);
    config.filename = template.path;

    lasso.lassoPage(config)
        .then(function() {
            logger.info('Page "' + page + '" processed.');
            callback(null);
        })
        .catch(function(err) {
            logger.info('Failed to lasso page: ', err);
            callback(err);
        })
    ;

  }, function(err) {
    if (err) {
      callback(err);
      return;
    }

    callback();
  });
}
