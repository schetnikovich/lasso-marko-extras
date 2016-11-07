/* eslint no-console: 0 */

require('./configure');
var extras = require('../../lib');

require('raptor-logging').configure({
  loggers: {
    'lasso-marko-extras': 'DEBUG'
  }
});

// Specify any files that needs to be copied to assets folder (build/static)
var files = [
  'layouts/base/favicon.ico'
];

// Specify pages
var pages = [
  'pages/home'
];

extras.process(__dirname, files, pages, function(err) {
  if (err) {
    console.log('Failed to process assets!');
    throw err;
  }

  console.log('Assets processed!');
});
