# Contributing

Contributions are always welcome, no matter how large or small. Before contributing, please read the [code of conduct](CODE_OF_CONDUCT.md).

+ If you've found some bug, [file an issue](https://github.com/boopathi/babel-minify/issues/new).
+ If you've found some fix for a bug, either [file an issue](https://github.com/boopathi/babel-minify/issues/new) mentioning the bug and the fix or send a Pull Request.

## Requirements

+ Node 5 or greater

## Monorepo

This project follows a monorepo approach similar to [Babel](https://github.com/babel/babel), and you can read more about it here - https://github.com/babel/babel/blob/master/doc/design/monorepo.md

## Install for dev

Install all dev dependencies

```sh
npm install
```

Bootstrap packages and links them. This project uses [lerna](https://github.com/lerna/lerna) and you can read more about what bootstrap means here - https://github.com/lerna/lerna#bootstrap

```sh
`npm bin`/lerna bootstrap
```

## Build

Builds all packages. Each package has a `src/` directory and gets transpiled for Node 5 into `lib/` directory.

```sh
npm run build
```

To do incremental builds on file change, start the watch process,

```sh
npm run watch
```

## Test

```sh
# Runs test for all packages
npm test
```
