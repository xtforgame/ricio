"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WsApp = function () {
  function WsApp() {
    var _this = this;

    _classCallCheck(this, WsApp);

    this.callback = function () {
      return function (ctx) {
        return _this._run(ctx);
      };
    };

    this.middlewares = [];
  }

  _createClass(WsApp, [{
    key: "use",
    value: function use(middleware) {
      this.middlewares.push(middleware);
    }
  }, {
    key: "_run",
    value: function _run(ctx) {
      var _this2 = this;

      var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      if (index >= this.middlewares.length) {
        return Promise.resolve(null);
      }
      return Promise.resolve().then(function () {
        var next = function next() {
          return _this2._run(ctx, index + 1);
        };
        return _this2.middlewares[index](ctx, next);
      });
    }
  }]);

  return WsApp;
}();

exports.default = WsApp;