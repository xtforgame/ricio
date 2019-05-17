"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _index = require("../ws/index");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var WsProtocolApiBase = function () {
  function WsProtocolApiBase(wsPeer, wsPeerManager) {
    _classCallCheck(this, WsProtocolApiBase);

    _defineProperty(this, "wsPeer", void 0);

    _defineProperty(this, "wsPeerManager", void 0);

    this.wsPeer = wsPeer;
    this.wsPeerManager = wsPeerManager;
  }

  _createClass(WsProtocolApiBase, [{
    key: "open",
    value: function open(url) {
      return Promise.reject(new Error('Not implemented'));
    }
  }, {
    key: "close",
    value: function close(code, reason) {
      return Promise.reject(new Error('Not implemented'));
    }
  }, {
    key: "send",
    value: function send(msgConfig) {
      var config = Object.assign({}, msgConfig, {
        method: 'SEND'
      });
      var msg = new _index.AzWsMessage(config);
      return this.wsPeer.send(msg.build());
    }
  }]);

  return WsProtocolApiBase;
}();

exports["default"] = WsProtocolApiBase;