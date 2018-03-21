'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ws = require('../ws');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ApiBase = function () {
  function ApiBase(wsPeer, wsPeerManager) {
    _classCallCheck(this, ApiBase);

    this.wsPeer = wsPeer;
    this.wsPeerManager = wsPeerManager;
  }

  _createClass(ApiBase, [{
    key: 'open',
    value: function open(url) {
      return Promise.reject('Not implemented');
    }
  }, {
    key: 'close',
    value: function close(code, reason) {
      return Promise.reject('Not implemented');
    }
  }, {
    key: 'send',
    value: function send(msgConfig) {
      var config = Object.assign({}, msgConfig, { method: 'SEND' });
      var msg = new _ws.AzWsMessage(config);
      return this.wsPeer.send(msg.build());
    }
  }]);

  return ApiBase;
}();

exports.default = ApiBase;