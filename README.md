# lasso-marko-extras

Build static assets and compile Marko templates:

```js
// Configure Lasso before using this module
require('lasso').configure({
  // ... 
});

require('lasso-marko-extras').build({
  baseDir: __dirname,
  files: [
    'layouts/base/favicon.ico'
    'pages/index/image.png'
  ],
  pages: [
    'pages/index',
    'pages/login',
    'pages/terms/pages/about',
    'pages/switcher/pages/faq'
  ]
});
```

Above script will do the following:

1. It cleanups ".cache/lasso" and "static" folders

2. Depending on configuration of Lasso, it builds, minifies, fingerprints and move 
   all static assets to `outputDir` (Lasso config option) folder using 
   `lasso.lassoResource()` and `lasso.lassoPage()`.
   
3. It recompiles all Marko templates (*.marko) in `baseDir` folder using `markoc`
   compiler.
   
Enable console output for this module by adding the following lines at the top
of the file:

```js
require('raptor-logging').configure({
  loggers: {
    'lasso-marko-extras': 'INFO'
  }
});
```

This module doesn't introduce dependencies on Lasso or Marko and assumes
that your project already depends on them. Check sample project that uses this module: 
[lasso-marko-startkit](https://github.com/schetnikovich/lasso-marko-startkit)

Here is the sample output:

```
INFO lasso-marko-extras/lib/compiler: Output: test/site/layouts/base/template.marko.js
INFO lasso-marko-extras/lib/compiler: Output: test/site/pages/home/template.marko.js
INFO lasso-marko-extras/lib/compiler: Compiled 2 templates(s)
INFO lasso-marko-extras/lib/builder: Folder /Users/dmitry/main/dev/lasso-marko-extras/.cache/lasso removed
INFO lasso-marko-extras/lib/builder: Folder /Users/dmitry/main/dev/lasso-marko-extras/test/site/static removed
INFO lasso-marko-extras/lib/builder: File "layouts/base/favicon.ico" processed.
INFO lasso-marko-extras/lib/builder: Files processed!
INFO lasso-marko-extras/lib/builder: Page "pages/home" processed.
INFO lasso-marko-extras/lib/builder: Build complete!
```


## Page tag

This module also introduces `<lasso-page-json />` tag that is a wrapper around
`<lasso-page />` tag. This tag has no attributes.

The only difference is that `<lasso-page-json />` tag reads configuration from 
`page.json` file, located in the same folder where template is located. This allows 
to build static assets with the same configuration options. `build()` function
shown above reads page configuration from `page.json` file, if available.

In short, if you ever need to specify some attributes on `lasso-page` tag, specify 
them in `page.json` file and use `<lasso-page-json />` without attributes.

page.json:

```json
{
  "name": "switcher-faq",
  "cacheKey": "someUniqueKey",
  "flags": ["foo", "bar"]
}
```

template.marko:

```html
<lasso-page-json />
...
```

