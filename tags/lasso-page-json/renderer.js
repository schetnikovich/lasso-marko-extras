/**
 * Defines <app-page /> tag, wrapper around <lasso-page /> tag.
 *
 * The only difference is that it reads configuration from "page.json" file,
 * located in the same folder where template is located. This allows to
 * build static assets with the same configuration options.
 *
 * See "src/build.js" for build process.
 *
 * Example:
 *
 *   {
 *     "name": "about",
 *     "packagePath": "./browser.json",
 *     "cacheKey": "some-unique-key"
 *   }
 */

var lassoPageTag = require('lasso/taglib/page-tag');
var path = require('path');
var fs = require('fs');

var cache = {};

exports.renderer = function(input, out) {
  // Path to custom "page.json" config
  var configPath = path.join(input.dirname, 'page.json');

  // Cache config content (actually, we cache only call to "fs.existsSync())
  if (cache[configPath] === undefined) {
    var exists = fs.existsSync(configPath);
    cache[configPath] = exists ? require(configPath) : {};
  }

  var config = cache[configPath];
  config.dirname = input.dirname;
  config.filename = input.filename;
  lassoPageTag(config, out);
};
