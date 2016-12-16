let babel                = require("../lib/api/node");
let buildExternalHelpers = require("../lib/tools/build-external-helpers");
let sourceMap            = require("source-map");
let assert               = require("assert");
let Plugin               = require("../lib/transformation/plugin");
let generator            = require("babel-generator").default;

function assertIgnored(result) {
  assert.ok(result.ignored);
}

function assertNotIgnored(result) {
  assert.ok(!result.ignored);
}

// shim
function transformAsync(code, opts) {
  return {
    then: function (resolve) {
      resolve(babel.transform(code, opts));
    }
  };
}

describe("parser and generator options", function() {
  let recast = {
    parse: function(code, opts) {
      return opts.parser.parse(code);
    },
    print: function(ast) {
      return generator(ast);
    }
  };

  function newTransform(string) {
    return babel.transform(string, {
      parserOpts: {
        parser: recast.parse,
        plugins: ["flow"],
        allowImportExportEverywhere: true
      },
      generatorOpts: {
        generator: recast.print
      }
    });
  }

  it("options", function() {
    let string = "original;";
    assert.deepEqual(newTransform(string).ast, babel.transform(string).ast);
    assert.equal(newTransform(string).code, string);
  });

  it("experimental syntax", function() {
    let experimental = "var a: number = 1;";

    assert.deepEqual(newTransform(experimental).ast, babel.transform(experimental, {
      parserOpts: {
        plugins: ["flow"]
      }
    }).ast);
    assert.equal(newTransform(experimental).code, experimental);

    function newTransformWithPlugins(string) {
      return babel.transform(string, {
        plugins: [__dirname + "/../../babel-plugin-syntax-flow"],
        parserOpts: {
          parser: recast.parse
        },
        generatorOpts: {
          generator: recast.print
        }
      });
    }

    assert.deepEqual(newTransformWithPlugins(experimental).ast, babel.transform(experimental, {
      parserOpts: {
        plugins: ["flow"]
      }
    }).ast);
    assert.equal(newTransformWithPlugins(experimental).code, experimental);
  });

  it("other options", function() {
    let experimental = "if (true) {\n  import a from 'a';\n}";

    assert.notEqual(newTransform(experimental).ast, babel.transform(experimental, {
      parserOpts: {
        allowImportExportEverywhere: true
      }
    }).ast);
    assert.equal(newTransform(experimental).code, experimental);
  });
});

describe("api", function () {
  it("analyze", function () {
    assert.equal(babel.analyse("foobar;").marked.length, 0);

    assert.equal(babel.analyse("foobar;", {
      plugins: [new Plugin({
        visitor: {
          Program: function (path) {
            path.mark("category", "foobar");
          }
        }
      })]
    }).marked[0].message, "foobar");

    assert.equal(babel.analyse("foobar;", {}, {
      Program: function (path) {
        path.mark("category", "foobar");
      }
    }).marked[0].message, "foobar");
  });

  it("transformFile", function (done) {
    babel.transformFile(__dirname + "/fixtures/api/file.js", {}, function (err, res) {
      if (err) return done(err);
      assert.equal(res.code, "foo();");
      done();
    });
  });

  it("transformFileSync", function () {
    assert.equal(babel.transformFileSync(__dirname + "/fixtures/api/file.js", {}).code, "foo();");
  });

  it("options throw on falsy true", function () {
    return assert.throws(
      function () {
        babel.transform("", {
          plugins: [__dirname + "/../../babel-plugin-syntax-jsx", false]
        });
      },
      /TypeError: Falsy value found in plugins/
    );
  });

  it("options merge backwards", function () {
    return transformAsync("", {
      presets: [__dirname + "/../../babel-preset-es2015"],
      plugins: [__dirname + "/../../babel-plugin-syntax-jsx"]
    }).then(function (result) {
      assert.ok(result.options.plugins[0][0].manipulateOptions.toString().indexOf("jsx") >= 0);
    });
  });

  it("option wrapPluginVisitorMethod", function () {
    let calledRaw = 0;
    let calledIntercept = 0;

    babel.transform("function foo() { bar(foobar); }", {
      wrapPluginVisitorMethod: function (pluginAlias, visitorType, callback) {
        if (pluginAlias !== "foobar") {
          return callback;
        }

        assert.equal(visitorType, "enter");

        return function () {
          calledIntercept++;
          return callback.apply(this, arguments);
        };
      },

      plugins: [new Plugin({
        name: "foobar",
        visitor: {
          "Program|Identifier": function () {
            calledRaw++;
          }
        }
      })]
    });

    assert.equal(calledRaw, 4);
    assert.equal(calledIntercept, 4);
  });

  it("pass per preset", function () {
    let aliasBaseType = null;

    function execTest(passPerPreset) {
      return babel.transform("type Foo = number; let x = (y): Foo => y;", {
        passPerPreset: passPerPreset,
        presets: [
          // First preset with our plugin, "before"
          {
            plugins: [
              new Plugin({
                visitor: {
                  Function: function(path) {
                    let alias = path.scope.getProgramParent().path.get("body")[0].node;
                    if (!babel.types.isTypeAlias(alias)) return;

                    // In case of `passPerPreset` being `false`, the
                    // alias node is already removed by Flow plugin.
                    if (!alias) {
                      return;
                    }

                    // In case of `passPerPreset` being `true`, the
                    // alias node should still exist.
                    aliasBaseType = alias.right.type; // NumberTypeAnnotation
                  }
                }
              })
            ]
          },

          // ES2015 preset
          require(__dirname + "/../../babel-preset-es2015"),

          // Third preset for Flow.
          {
            plugins: [
              require(__dirname + "/../../babel-plugin-syntax-flow"),
              require(__dirname + "/../../babel-plugin-transform-flow-strip-types"),
            ]
          }
        ],
      });
    }

    // 1. passPerPreset: true

    let result = execTest(true);

    assert.equal(aliasBaseType, "NumberTypeAnnotation");

    assert.deepEqual([
      "\"use strict\";",
      "",
      "var x = function x(y) {",
      "  return y;",
      "};"
    ].join("\n"), result.code);

    // 2. passPerPreset: false

    aliasBaseType = null;

    result = execTest(false);

    assert.equal(aliasBaseType, null);

    assert.deepEqual([
      "\"use strict\";",
      "",
      "var x = function x(y) {",
      "  return y;",
      "};"
    ].join("\n"), result.code);

  });

  it("handles preset shortcuts (adds babel-preset-)", function () {
    return assert.throws(
      function () {
        babel.transform("", {
          presets: ["@babel/es2015"]
        });
      },
      /Couldn\'t find preset \"\@babel\/babel\-preset\-es2015\" relative to directory/
    );
  });

  it("handles preset shortcuts 2 (adds babel-preset-)", function () {
    return assert.throws(
      function () {
        babel.transform("", {
          presets: ["@babel/react/optimizations"]
        });
      },
      /Couldn\'t find preset \"\@babel\/babel\-preset\-react\/optimizations\" relative to directory/
    );
  });

  it("source map merging", function () {
    let result = babel.transform([
      "function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }",
      "",
      "let Foo = function Foo() {",
      "  _classCallCheck(this, Foo);",
      "};",
      "",
      "//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0ZG91dCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUFNLEdBQUcsWUFBSCxHQUFHO3dCQUFILEdBQUciLCJmaWxlIjoidW5kZWZpbmVkIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgRm9vIHt9XG4iXX0="
    ].join("\n"), {
      sourceMap: true
    });

    assert.deepEqual([
      "function _classCallCheck(instance, Constructor) {",
      "  if (!(instance instanceof Constructor)) {",
      "    throw new TypeError(\"Cannot call a class as a function\");",
      "  }",
      "}",
      "",
      "let Foo = function Foo() {",
      "  _classCallCheck(this, Foo);",
      "};"
    ].join("\n"), result.code);

    let consumer = new sourceMap.SourceMapConsumer(result.map);

    assert.deepEqual(consumer.originalPositionFor({
      line: 7,
      column: 4
    }), {
      name: null,
      source: "stdout",
      line: 1,
      column: 6
    });
  });

  it("code option false", function () {
    return transformAsync("foo('bar');", { code: false }).then(function (result) {
      assert.ok(!result.code);
    });
  });

  it("ast option false", function () {
    return transformAsync("foo('bar');", { ast: false }).then(function (result) {
      assert.ok(!result.ast);
    });
  });

  it("auxiliaryComment option", function () {
    return transformAsync("class Foo {}", {
      auxiliaryCommentBefore: "before",
      auxiliaryCommentAfter: "after",
      plugins: [function (babel) {
        let t = babel.types;
        return {
          visitor: {
            Program: function (path) {
              path.unshiftContainer("body", t.expressionStatement(t.identifier("start")));
              path.pushContainer("body", t.expressionStatement(t.identifier("end")));
            }
          }
        };
      }]
    }).then(function (result) {
      assert.equal(result.code, "/*before*/start;\n/*after*/class Foo {}\n/*before*/end;\n/*after*/");
    });
  });

  it("modules metadata", function () {
    return Promise.all([
      transformAsync("import { externalName as localName } from \"external\";").then(function (result) {
        assert.deepEqual(result.metadata.modules.imports[0], {
          source: "external",
          imported: ["externalName"],
          specifiers: [{
            kind: "named",
            imported: "externalName",
            local: "localName"
          }]
        });
      }),

      transformAsync("import * as localName2 from \"external\";").then(function (result) {
        assert.deepEqual(result.metadata.modules.imports[0], {
          source: "external",
          imported: ["*"],
          specifiers: [{
            kind: "namespace",
            local: "localName2"
          }]
        });
      }),

      transformAsync("import localName3 from \"external\";").then(function (result) {
        assert.deepEqual(result.metadata.modules.imports[0], {
          source: "external",
          imported: ["default"],
          specifiers: [{
            kind: "named",
            imported: "default",
            local: "localName3"
          }]
        });
      }),

      transformAsync("import localName from \"./array\";", {
        resolveModuleSource: function() {
          return "override-source";
        }
      }).then(function (result) {
        assert.deepEqual(result.metadata.modules.imports, [
          {
            source: "override-source",
            imported: ["default"],
            specifiers: [
              {
                "kind": "named",
                "imported": "default",
                "local": "localName"
              }
            ]
          }
        ]);
      }),

      transformAsync("export * as externalName1 from \"external\";", {
        plugins: [require("../../babel-plugin-syntax-export-extensions")]
      }).then(function (result) {
        assert.deepEqual(result.metadata.modules.exports, {
          exported: ["externalName1"],
          specifiers: [{
            kind: "external-namespace",
            exported: "externalName1",
            source: "external",
          }]
        });
      }),

      transformAsync("export externalName2 from \"external\";", {
        plugins: [require("../../babel-plugin-syntax-export-extensions")]
      }).then(function (result) {
        assert.deepEqual(result.metadata.modules.exports, {
          exported: ["externalName2"],
          specifiers: [{
            kind: "external",
            local: "externalName2",
            exported: "externalName2",
            source: "external"
          }]
        });
      }),

      transformAsync("export function namedFunction() {}").then(function (result) {
        assert.deepEqual(result.metadata.modules.exports, {
          exported: ["namedFunction"],
          specifiers: [{
            kind: "local",
            local: "namedFunction",
            exported: "namedFunction"
          }]
        });
      }),

      transformAsync("export var foo = \"bar\";").then(function (result) {
        assert.deepEqual(result.metadata.modules.exports, {
          "exported": ["foo"],
          specifiers: [{
            kind: "local",
            local: "foo",
            exported: "foo"
          }]
        });
      }),

      transformAsync("export { localName as externalName3 };").then(function (result) {
        assert.deepEqual(result.metadata.modules.exports, {
          exported: ["externalName3"],
          specifiers: [{
            kind: "local",
            local: "localName",
            exported: "externalName3"
          }]
        });
      }),

      transformAsync("export { externalName4 } from \"external\";").then(function (result) {
        assert.deepEqual(result.metadata.modules.exports, {
          exported: ["externalName4"],
          specifiers: [{
            kind: "external",
            local: "externalName4",
            exported: "externalName4",
            source: "external"
          }]
        });
      }),

      transformAsync("export * from \"external\";").then(function (result) {
        assert.deepEqual(result.metadata.modules.exports, {
          exported: [],
          specifiers: [{
            kind: "external-all",
            source: "external"
          }]
        });
      }),

      transformAsync("export default function defaultFunction() {}").then(function (result) {
        assert.deepEqual(result.metadata.modules.exports, {
          exported: ["defaultFunction"],
          specifiers: [{
            kind: "local",
            local: "defaultFunction",
            exported: "default"
          }]
        });
      })
    ]);
  });

  it("ignore option", function () {
    return Promise.all([
      transformAsync("", {
        ignore: "node_modules",
        filename: "/foo/node_modules/bar"
      }).then(assertIgnored),

      transformAsync("", {
        ignore: "foo/node_modules",
        filename: "/foo/node_modules/bar"
      }).then(assertIgnored),

      transformAsync("", {
        ignore: "foo/node_modules/*.bar",
        filename: "/foo/node_modules/foo.bar"
      }).then(assertIgnored)
    ]);
  });

  it("only option", function () {
    return Promise.all([
      transformAsync("", {
        only: "node_modules",
        filename: "/foo/node_modules/bar"
      }).then(assertNotIgnored),

      transformAsync("", {
        only: "foo/node_modules",
        filename: "/foo/node_modules/bar"
      }).then(assertNotIgnored),

      transformAsync("", {
        only: "foo/node_modules/*.bar",
        filename: "/foo/node_modules/foo.bar"
      }).then(assertNotIgnored),

      transformAsync("", {
        only: "node_modules",
        filename: "/foo/node_module/bar"
      }).then(assertIgnored),

      transformAsync("", {
        only: "foo/node_modules",
        filename: "/bar/node_modules/foo"
      }).then(assertIgnored),

      transformAsync("", {
        only: "foo/node_modules/*.bar",
        filename: "/foo/node_modules/bar.foo"
      }).then(assertIgnored)
    ]);
  });

  describe("env option", function () {
    let oldBabelEnv = process.env.BABEL_ENV;
    let oldNodeEnv = process.env.NODE_ENV;

    setup(function () {
      // Tests need to run with the default and specific values for these. They
      // need to be cleared for each test.
      delete process.env.BABEL_ENV;
      delete process.env.NODE_ENV;
    });

    suiteTeardown(function () {
      process.env.BABEL_ENV = oldBabelEnv;
      process.env.NODE_ENV = oldNodeEnv;
    });

    it("default", function () {
      let result = babel.transform("foo;", {
        env: {
          development: { code: false }
        }
      });

      assert.equal(result.code, undefined);
    });

    it("BABEL_ENV", function () {
      process.env.BABEL_ENV = "foo";
      let result = babel.transform("foo;", {
        env: {
          foo: { code: false }
        }
      });
      assert.equal(result.code, undefined);
    });

    it("NODE_ENV", function () {
      process.env.NODE_ENV = "foo";
      let result = babel.transform("foo;", {
        env: {
          foo: { code: false }
        }
      });
      assert.equal(result.code, undefined);
    });
  });

  it("resolveModuleSource option", function () {
    let actual = "import foo from \"foo-import-default\";\nimport \"foo-import-bare\";\nexport { foo } from \"foo-export-named\";";
    let expected = "import foo from \"resolved/foo-import-default\";\nimport \"resolved/foo-import-bare\";\nexport { foo } from \"resolved/foo-export-named\";";

    return transformAsync(actual, {
      resolveModuleSource: function (originalSource) {
        return "resolved/" + originalSource;
      }
    }).then(function (result) {
      assert.equal(result.code.trim(), expected);
    });
  });

  describe("buildExternalHelpers", function () {
    it("all", function () {
      let script = buildExternalHelpers();
      assert.ok(script.indexOf("classCallCheck") >= -1);
      assert.ok(script.indexOf("inherits") >= 0);
    });

    it("whitelist", function () {
      let script = buildExternalHelpers(["inherits"]);
      assert.ok(script.indexOf("classCallCheck") === -1);
      assert.ok(script.indexOf("inherits") >= 0);
    });

    it("empty whitelist", function () {
      let script = buildExternalHelpers([]);
      assert.ok(script.indexOf("classCallCheck") === -1);
      assert.ok(script.indexOf("inherits") === -1);
    });

    it("underscored", function () {
      let script = buildExternalHelpers(["typeof"]);
      assert.ok(script.indexOf("typeof") >= 0);
    });
  });
});
