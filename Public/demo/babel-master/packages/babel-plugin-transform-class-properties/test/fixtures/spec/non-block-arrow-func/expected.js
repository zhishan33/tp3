export default (param => {
  var _class, _temp;

  return _temp = _class = function () {
    function App() {
      babelHelpers.classCallCheck(this, App);
    }

    babelHelpers.createClass(App, [{
      key: 'getParam',
      value: function getParam() {
        return param;
      }
    }]);
    return App;
  }(), Object.defineProperty(_class, 'props', {
    enumerable: true,
    writable: true,
    value: {
      prop1: 'prop1',
      prop2: 'prop2'
    }
  }), _temp;
});
