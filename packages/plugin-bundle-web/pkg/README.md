# @pika/plugin-bundle-web

> A [@pika/pack](https://github.com/pikapkg/pack) build plugin.
> Adds a bundled Web distribution to your package, built & optimized to run in most web browsers (and bundlers). Useful for hosting on a CDN like UNPKG and/or when package dependencies aren't written to run natively on the web.


## Install

```sh
# npm:
npm install @pika/plugin-bundle-web --save-dev
# yarn:
yarn add @pika/plugin-bundle-web --dev
```


## Usage

```json
{
  "name": "example-package-json",
  "version": "1.0.0",
  "@pika/pack": {
    "pipeline": [
      ["@pika/plugin-standard-pkg"],
      ["@pika/plugin-build-web"],
      ["@pika/plugin-bundle-web"]
    ]
  }
}
```

For more information about @pika/pack & help getting started, [check out the main project repo](https://github.com/pikapkg/pack).


## Result

1. Adds a web bundled distribution to your built package: `dist-web/index.bundled.js`
  1. ES Module (ESM) Syntax
  1. Transpiled to run on all browsers where ES Module syntax is supported.
  1. All dependencies inlined into this file.

Note that this does not add or modify the "module" entrypoint to your package.json. Bundles should continue to use the "module" entrypoint, while this build can be loaded directly in the browser (from a CDN like UNPKG).