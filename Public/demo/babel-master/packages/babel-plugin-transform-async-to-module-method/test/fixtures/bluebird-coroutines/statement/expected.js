import { coroutine as _coroutine } from "bluebird";

let foo = (() => {
  var _ref = _coroutine(function* () {
    var wat = yield bar();
  });

  return function foo() {
    return _ref.apply(this, arguments);
  };
})();
