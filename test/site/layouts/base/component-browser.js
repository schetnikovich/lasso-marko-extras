//
// When you use 'component-browser.js', instead of 'component.js', rendering logic
// of component will not be send to browser. Only logic inside 'component-browser.js'
//
// Marko calls such feature as 'split components'
// http://markojs.com/docs/components/#split-components
//
// It is a bad idea to send rendering logic of basic layouts, that just contain HTML
// page skeleton (with almost empty <body /> tag). Marko will fail to to do it.
//
// If you still need some JS to be provided with every page, that uses this layout,
// write it here, or use "browser.json" file.
//
