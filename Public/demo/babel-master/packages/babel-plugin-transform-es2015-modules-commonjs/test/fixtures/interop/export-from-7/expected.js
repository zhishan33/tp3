"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _foo = require("foo");

Object.defineProperty(exports, "foo", {
  enumerable: true,
  get: function () {
    return babelHelpers.interopRequireDefault(_foo).default;
  }
});
