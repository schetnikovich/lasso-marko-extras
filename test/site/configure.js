/**
 * The following line allows application-level modules to be required as if
 * they were installed into the node_modules directory.
 * IMPORTANT: The search path should be modified before any modules are loaded!
 *
 * Instead of this:
 *    var module = require('../../../module')
 *
 * You can write this:
 *    var module = require('src/path/to/module')
 */
require('app-module-path').addPath(__dirname + '/..');

/**
 * Marko provides a custom Node.js require extension that allows Marko templates
 * to be require'd just like a standard JavaScript module.
 *
 * Instead of this:
 *     var template = require('marko').load(require.resolve('./template.marko'));
 *
 * You can write:
 *     var template = require('./template.marko');
 */
require('marko/node-require').install();


/**
 * Dependencies can be "required" inside a JavaScript module as shown in the following
 * sample JavaScript code:
 *
 *    require('./style.less');
 *
 * The only caveat to using a require() call to add a non-JavaScript module dependency is
 * that by default Node.js will try to load the required file as a JavaScript module if the
 * code runs on the server. To prevent Node.js from trying to load a Less file or other
 * non-JavaScript files as JavaScript modules you enable 'no-op' for the following extensions:
 */
require('lasso/node-require-no-op').enable('.less', '.css');

var production = (process.env.NODE_ENV === 'production');
var cacheProfile = production ? 'production' : 'development';

// Configure the Lasso.js
require('lasso').configure({
  plugins: [
    'lasso-marko',  // Auto compile Marko template files
    'lasso-less'    // Add support for Less files
  ],

  cacheProfile: cacheProfile,

  // Directory where generated JS and CSS bundles are written
  outputDir: require('path').join(__dirname, 'static'),

  // URL prefix for static assets
  urlPrefix: '/static',

  // Only bundle up JS and CSS files in production builds
  bundlingEnabled: true,
  bundles: [],

  // Only minify JS and CSS files in production builds
  minify: production,

  // Only fingerprint JS and CSS files in production builds
  fingerprintsEnabled: production
});