'use strict';

// @flow
var C = function () {
  function C() {
    babelHelpers.classCallCheck(this, C);
  }

  C.prototype.m = function m(x /*: number*/) /*: string*/ {
    return 'a';
  };

  return C;
}();
