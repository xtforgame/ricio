"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var WsApp = function () {
  function WsApp() {
    var _this = this;

    _classCallCheck(this, WsApp);

    _defineProperty(this, "middlewares", void 0);

    _defineProperty(this, "callback", function () {
      return function (ctx) {
        return _this._run(ctx);
      };
    });

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

exports["default"] = WsApp;