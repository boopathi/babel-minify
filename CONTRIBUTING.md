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
npm run bootstrap
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

## Lint - eslint

```sh
npm run lint
```

+ config for sources `packages/*/src/*.js` - [`.eslintrc`](.eslintrc)
+ config for tests `packages/*/test/*.js` - [`test.eslintrc`](utils/test.eslintrc)

## Type check - flow

Flow annotations are used in comments (https://flowtype.org/blog/2015/02/20/Flow-Comments.html)

```sh
npm run flow
```

Declarations for libraries are here in this directory - [declarations](declarations)

## Test

```sh
# Runs test for all packages
npm test
```

To test individual packages, use `TEST_GREP` env to provide a GREP string. All the tests are titled with their respective package names. So, to test just the package `babel-plugin-transform-mangle`,

```sh
TEST_GREP=mangle npm test
```
