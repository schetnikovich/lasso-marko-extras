var async = require('async');
var path = require('path');
var lasso = require('lasso');
var logger = require('raptor-logging').logger(module);

exports.processFiles = processFiles;
exports.processPages = processPages;
exports.process = process;

// ---------------------------
// Processing of files and pages
// ---------------------------

function process(files, pages, callback) {
  processFiles(files, function(err) {
    if (err) {
      callback(err);
      return;
    }

    logger.info('Files processed!');

    processPages(pages, function(err) {
      if (err) {
        callback(err);
        return;
      }

      logger.info('Build complete!');
      callback(null);
    });
  });
}

function processFiles(prefix, files, callback) {
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

function processPages(prefix, pages, callback) {
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
