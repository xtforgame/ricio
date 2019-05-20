"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.AzWsMessageCtx = void 0;

var _index = require("../../ws/index");

var _apiBase = _interopRequireDefault(require("../api-base"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var AzWsMessageCtx = function (_AzWsMessage) {
  _inherits(AzWsMessageCtx, _AzWsMessage);

  function AzWsMessageCtx(config, rcPeer) {
    var _this;

    _classCallCheck(this, AzWsMessageCtx);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(AzWsMessageCtx).call(this, config));

    _defineProperty(_assertThisInitialized(_this), "rcPeer", void 0);

    _defineProperty(_assertThisInitialized(_this), "rcResponse", void 0);

    _defineProperty(_assertThisInitialized(_this), "request", void 0);

    _defineProperty(_assertThisInitialized(_this), "throw", function (status, message, optioins) {});

    _this.rcPeer = rcPeer;
    return _this;
  }

  return AzWsMessageCtx;
}(_index.AzWsMessage);

exports.AzWsMessageCtx = AzWsMessageCtx;

var WsProtocolApi = function (_WsProtocolApiBase) {
  _inherits(WsProtocolApi, _WsProtocolApiBase);

  function WsProtocolApi() {
    _classCallCheck(this, WsProtocolApi);

    return _possibleConstructorReturn(this, _getPrototypeOf(WsProtocolApi).apply(this, arguments));
  }

  _createClass(WsProtocolApi, [{
    key: "open",
    value: function open(url) {
      return Promise.resolve(this);
    }
  }, {
    key: "send",
    value: function send(msgConfig) {
      var _this2 = this;

      var config = Object.assign({}, msgConfig, {
        method: 'SEND'
      });
      var msg = new _index.AzWsMessage(config);
      return new Promise(function (resolve, reject) {
        _this2.wsPeer.send(msg.build(), function (error) {
          if (error) {
            try {
              _this2.wsPeer.emit('error', error);

              _this2.wsPeer.close(3005, 'Unable to send data');
            } catch (error) {
              return reject(error);
            }

            return reject(error);
          }

          return resolve();
        });
      });
    }
  }, {
    key: "close",
    value: function close(code, reason) {
      if (this.wsPeer) {
        try {
          this.wsPeer.close(code, reason);
          return Promise.resolve();
        } catch (error) {
          return Promise.reject(error);
        }
      }

      return Promise.resolve();
    }
  }]);

  return WsProtocolApi;
}(_apiBase["default"]);

var _default = WsProtocolApi;
exports["default"] = _default;