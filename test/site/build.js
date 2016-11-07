/* eslint no-console: 0 */

require('./configure');
var extras = require('../../lib');

require('raptor-logging').configure({
  loggers: {
    'lasso-marko-extras': 'INFO'
  }
});

extras.build({
  baseDir: __dirname,
  files: ['layouts/base/favicon.ico'],
  pages: ['pages/home']
});
