var Test = function (_Foo) {
  babelHelpers.inherits(Test, _Foo);

  function Test() {
    babelHelpers.classCallCheck(this, Test);

    var _this = babelHelpers.possibleConstructorReturn(this, (Test.__proto__ || Object.getPrototypeOf(Test)).call(this));

    babelHelpers.get(Test.prototype.__proto__ || Object.getPrototypeOf(Test.prototype), "test", _this).whatever();
    babelHelpers.get(Test.prototype.__proto__ || Object.getPrototypeOf(Test.prototype), "test", _this).call(_this);
    return _this;
  }

  babelHelpers.createClass(Test, null, [{
    key: "test",
    value: function test() {
      return babelHelpers.get(Test.__proto__ || Object.getPrototypeOf(Test), "wow", this).call(this);
    }
  }]);
  return Test;
}(Foo);
