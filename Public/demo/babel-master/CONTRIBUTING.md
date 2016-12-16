# NOTE: DO NOT OPEN ISSUES FOR QUESTIONS AND SUPPORT. SEE THE README FOR MORE INFO.

----

<p align="center">
   <strong><a href="#setup">Setup</a></strong>
   |
   <strong><a href="#running-lintingtests">Running linting/tests</a></strong>
   |
   <strong><a href="#writing-tests">Writing tests</a></strong>
   |
   <strong><a href="#internals">Internals</a></strong>
</p>

----


# Contributing

> Before contributing, please read our [code of conduct](https://github.com/babel/babel/blob/master/CODE_OF_CONDUCT.md).

Contributions are always welcome, no matter how large or small.

## Not sure where to start?

- If you aren't just making a documentation change, you'll probably want to learn a bit about a few topics.
 - [ASTs](https://en.wikipedia.org/wiki/Abstract_syntax_tree) (Abstract Syntax Tree): The Babel AST [spec](https://github.com/babel/babylon/blob/master/ast/spec.md) is a bit different from [ESTree](https://github.com/estree/estree). The differences are listed [here](https://github.com/babel/babylon#output).
 - This repository's [`/doc`](/doc) directory for notes on Babel's internals
 - Check out [the Babel Plugin Handbook](https://github.com/thejameskyle/babel-handbook/blob/master/translations/en/plugin-handbook.md#babel-plugin-handbook) - core plugins are written the same way as any other plugin!
 - Check out [AST Explorer](http://astexplorer.net/#/scUfOmVOG5) to learn more about ASTs or make your own plugin in the browser
- When you feel ready to finally jump into the babel source code a good start is to look out for issues which are labeled with [help-wanted](https://github.com/babel/babel/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) and/or [beginner-friendly](https://github.com/babel/babel/issues?q=is%3Aissue+is%3Aopen+label%3A%22beginner-friendly%22).

## Chat

Feel free to check out the `#discussion`/`#development` channels on our [slack](https://slack.babeljs.io). Some of us are always online to chat!

## Developing

**Note:** Versions `< 5.1.10` can't be built.

Babel is built for node 0.10 and up but we develop using node 6. Make sure you are on npm 3.

You can check this with `node -v` and `npm -v`.

#### Setup

```sh
$ git clone https://github.com/babel/babel
$ cd babel
$ make bootstrap
```

Then you can either run:

```sh
$ make build
```

to build Babel **once** or:

```sh
$ make watch
```

to have Babel build itself and incrementally build files on change.

You can access the built files for individual packages from `packages/<package-name>/lib`.

If you wish to build a copy of Babel for distribution, then run:

```sh
$ make build-dist
```

#### Running linting/tests

You can run lint via:

```sh
# ~6 sec on a MacBook Pro (Mid 2015)
$ make lint
```

You can run eslint's autofix via:

```sh
$ make fix
```

You can run tests + lint for all packages (slow) via:

```sh
# ~46 sec on a MacBook Pro (Mid 2015)
$ make test
```

If you just want to run all tests:

```sh
# ~40 sec on a MacBook Pro (Mid 2015)
$ make test-only
```

Most likely you'll want to focus in on a specific issue.

To run tests for a specific package in [packages](/packages), you can use the `TEST_ONLY` environment variable:

```sh
$ TEST_ONLY=babel-cli make test
```

Use the `TEST_GREP` variable to run a subset of tests by name:

```sh
$ TEST_GREP=transformation make test
```

To enable the node debugger added in v6.3.0, set the `TEST_DEBUG` environment variable:

```sh
$ TEST_DEBUG=true make test
```

To test the code coverage, use:

```sh
$ make test-cov
```

#### Writing tests

Most packages in [`/packages`](/packages) have a `test` folder, however some tests might be in other packages or in [`/packages/babel-core`](/packages/babel-core/test/fixtures).

##### `babel-plugin-x`

All the Babel plugins (and other packages) that have a `/test/fixtures` are written in a similar way.

For example, in [`babel-plugin-transform-exponentiation-operator/test`](/packages/babel-plugin-transform-exponentiation-operator/test):

- There is an `index.js` file. It imports our [test helper](/packages/babel-helper-plugin-test-runner). (You don't have to worry about this).
- There can be multiple folders under [`/fixtures`](/packages/babel-plugin-transform-exponentiation-operator/test/fixtures)
   - There is an [`options.json`](/packages/babel-plugin-transform-exponentiation-operator/test/fixtures/exponentian-operator/options.json) file whose function is similar to a `.babelrc` file, allowing you to pass in the plugins and settings you need for your tests.
   - For this test, we only need the relevant plugin, so it's just `{ "plugins": ["transform-exponentiation-operator"] }`.
   - If necessary, you can have an `options.json` with different options in each subfolder.

- In each subfolder, you can organize your directory structure by categories of tests. (Example: these folders can be named after the feature you are testing or can reference the issue number they fix)
- Generally, there are two kinds of tests for plugins
   - The first is a simple test of the input and output produced by running Babel on some code. We do this by creating an [`actual.js`](packages/babel-plugin-transform-exponentiation-operator/test/fixtures/exponentian-operator/binary/actual.js) file and an [`expected.js`](/packages/babel-plugin-transform-exponentiation-operator/test/fixtures/exponentian-operator/binary/expected.js) file.
   - If you need to expect an error, you can ignore creating the `expected.js` file and pass a new `throws` key to the `options.json` that contains the error string that is created.
   - The second and preferred type is a test that actually evaluates the produced code and asserts that certain properties are true or false. We do this by creating an [`exec.js`](/packages/babel-plugin-transform-exponentiation-operator/test/fixtures/exponentian-operator/comprehensive/exec.js) file.

In an actual/expected test, you simply write out the code you want transformed in `actual.js`.

```js
// actual.js
2 ** 2;
```

and the expected output after transforming it with your `options.json` in `expected.js`.

```js
// expected.js
Math.pow(2, 2);
```
In an `exec.js` test, we run or check that the code actually does what it's supposed to do rather than just check the static output.

```js
// exec.js
assert.equal(8, 2 ** 3);
assert.equal(24, 3 * 2 ** 3);
```

If you need to check for an error that is thrown you can add to the `options.json`

```js
// options.json example
{
  "plugins": [["transform-object-rest-spread", { "useBuiltIns": "invalidOption" }]],
  "throws": "transform-object-rest-spread currently only accepts a boolean option for useBuiltIns (defaults to false)"
}
```

##### Bootstrapping expected output

For both `babel-plugin-x` and `babylon`, you can easily generate an `expected.js`/`expected.json` automatically by just providing `actual.js` and running the tests as you usually would.

```
// Example
- babylon
  - test
    - fixtures
      - comments
        - basic
          - block-trailing-comment
            - actual.js
            - expected.json (will be generated if not created)
```

#### Internals
- AST spec ([babylon/ast/spec.md](https://github.com/babel/babylon/blob/master/ast/spec.md))
- Versionning ([doc/design/versioning.md](./doc/design/versioning.md))
- Monorepo ([doc/design/monorepo.md](./doc/design/monorepo.md))
- Compiler environment support ([doc/design/compiler-environment-support.md](./doc/design/compiler-environment-support.md))
- Compiler assumptions ([doc/design/compiler-assumptions.md](./doc/design/compiler-assumptions.md))
