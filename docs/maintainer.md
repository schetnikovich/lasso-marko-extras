Sample site
-----------

Run:

    $ node test/site/server.js       # open localhost:8087

Build:

    $ node test/site/build.js


Update package
--------------

    $ npm login
    $ npm version <type>     # types: patch,  minor, major
    $ npm publish

Example. After updating, for instance README.md, do the following:

    $ npm version patch
    $ npm publish