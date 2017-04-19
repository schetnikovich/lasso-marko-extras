var logger = require('raptor-logging').logger(module);
var path = require('path');
var exec = require('child_process').exec;
var rootDir = require('app-root-dir').get();

exports.compile = compile;

/**
 * Compile all Marko templates in the project' root directory.
 * The following command executed:
 *
 *    node_modules/.bin/markoc . --force
 *
 * We omit some lines to make output more terse.
 *
 *
 * @param force Force compilation of templates
 */
function compile(force, callback) {
  var markoc = path.join(rootDir, 'node_modules/.bin/markoc');
  var command = markoc + ' . --clean';
  if (force) {
    command += ' --force';
  }

  var error = false;
  var proc = exec(command);
  proc.stdout.on('data', function(data) {

    var lines = data.split('\n');

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();

      // Ignore some lines for better UX
      if (line.length == 0 ||
          line.startsWith('Compiling:') ||
          line.startsWith('Input:')) {
        continue;
      }

      logger.info(line);
    }
  });

  proc.stderr.on('data', function(data) {
    logger.fatal(data);
    error = true;
  });

  proc.on('exit', function(/* code */) {
    // Unfortunately, exit code is always 0
    if (error) {
      if (callback) { callback('Could not compile Marko templates.'); }
      return;
    }

    if (callback) { callback(); }
  });
}


