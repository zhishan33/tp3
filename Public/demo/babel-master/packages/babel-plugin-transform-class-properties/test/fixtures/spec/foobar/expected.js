"use strict";

var Child = function (_Parent) {
    babelHelpers.inherits(Child, _Parent);

    function Child() {
        babelHelpers.classCallCheck(this, Child);

        var _this = babelHelpers.possibleConstructorReturn(this, (Child.__proto__ || Object.getPrototypeOf(Child)).call(this));

        Object.defineProperty(_this, "scopedFunctionWithThis", {
            enumerable: true,
            writable: true,
            value: function value() {
                _this.name = {};
            }
        });
        return _this;
    }

    return Child;
}(Parent);
