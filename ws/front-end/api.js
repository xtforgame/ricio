'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.WebsocketApi = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _apiBase = require('../api-base');

var _apiBase2 = _interopRequireDefault(_apiBase);

var _ws = require('../../ws');

var _makeCancelable = require('../../utils/makeCancelable');

var _makeCancelable2 = _interopRequireDefault(_makeCancelable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WebsocketApi = exports.WebsocketApi = function () {
  function WebsocketApi() {
    var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var EventEmitter = arguments[1];

    _classCallCheck(this, WebsocketApi);

    this.url = url;
    this.EventEmitter = EventEmitter;
    this.socket = null;
    this.state = 'closed';
    this.nativeEvents = new EventEmitter();
    this.binaryType = 'arraybuffer';
    this.openAsyncInfo = { promise: null };
  }

  _createClass(WebsocketApi, [{
    key: 'close',
    value: function close(code, reason) {
      if (this.socket) {
        this.openAsyncInfo = { promise: null };
        try {
          this.socket.close(code, reason);
        } catch (error) {
          return Promise.reject(error);
        }
        this.state = 'closed';
        this.socket = null;
      }
      return Promise.resolve();
    }
  }, {
    key: 'open',
    value: function open(url) {
      var _this = this;

      if ((!url || this.url === url) && this.state !== 'closed') {
        return this.openAsyncInfo.promise;
      }
      this.close();
      this.state = 'connecting';
      this.url = url || this.url;
      try {
        this.socket = new WebSocket(this.url);
      } catch (error) {
        this.state = 'closed';
        return Promise.reject(error);
      }
      this.socket.binaryType = this.binaryType;
      this.socket.onopen = function (evt) {
        _this.state = 'connected';
        _this.nativeEvents.emit('open', evt, _this);
        if (!_this.openAsyncInfo.isFulfilled) {
          _this.openAsyncInfo.isFulfilled = true;
          var resolve = _this.openAsyncInfo.resolve;

          resolve({ ws: _this, evt: evt });
        }
      };
      this.socket.onclose = function (evt) {
        _this.state = 'closed';
        _this.nativeEvents.emit('close', evt, _this);
      };
      this.socket.onmessage = function (evt) {
        if (evt.data instanceof ArrayBuffer) {
          _this.nativeEvents.emit('message', evt, _this);
        } else {
          _this.nativeEvents.emit('message', evt, _this);
        }
      };
      this.socket.onerror = function (evt) {
        _this.state = 'closed';
        _this.nativeEvents.emit('error', evt, _this);
        if (!_this.openAsyncInfo.isFulfilled) {
          _this.openAsyncInfo.isFulfilled = true;
          var reject = _this.openAsyncInfo.reject;

          reject({ ws: _this, evt: evt });
        }
      };

      this.openAsyncInfo.promise = new Promise(function (resolve, reject) {
        Object.assign(_this.openAsyncInfo, { resolve: resolve, reject: reject, isFulfilled: false });
      });
      return this.openAsyncInfo.promise;
    }
  }, {
    key: 'send',
    value: function send(msg) {
      if (!this.socket) {
        return Promise.reject(new Error('No Connection'));
      }
      this.socket.send(msg);
      return Promise.resolve();
    }
  }, {
    key: 'listenNative',
    value: function listenNative(events, cb) {
      var _this2 = this;

      if (typeof events === 'string') {
        return this.nativeEvents.addListener(events, cb);
      }
      return Object.keys(events).map(function (event) {
        return _this2.nativeEvents.addListener(event, events[event]);
      });
    }
  }, {
    key: 'unlistenNative',
    value: function unlistenNative(events, cb) {
      var _this3 = this;

      if (typeof events === 'string') {
        return this.nativeEvents.removeListener(events, cb);
      }
      return Object.keys(events).map(function (event) {
        return _this3.nativeEvents.removeListener(event, events[event]);
      });
    }
  }]);

  return WebsocketApi;
}();

var WsProtocolApi = function (_ApiBase) {
  _inherits(WsProtocolApi, _ApiBase);

  function WsProtocolApi() {
    var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var EventEmitter = arguments[1];
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, WsProtocolApi);

    var wsPeer = new WebsocketApi(url, EventEmitter);

    var _this4 = _possibleConstructorReturn(this, (WsProtocolApi.__proto__ || Object.getPrototypeOf(WsProtocolApi)).call(this, wsPeer, {}));

    _this4.wsOnMessage = function (_ref, ws) {
      var rawData = _ref.data;

      var wsMsg = new _ws.AzWsMessage({ rawData: rawData });
      wsMsg.body.json().then(function (data) {
        var evt = { rawData: rawData, wsMsg: wsMsg, data: data };
        _this4.events.emit('message', evt);
        if (wsMsg.method === 'RESPONSE' && wsMsg.msgId in _this4.waitResPromises) {
          _this4.events.emit('response', evt);
          if (!evt.wsMsg.status || evt.wsMsg.status < 200 || evt.wsMsg.status >= 400) {
            var error = {
              response: evt
            };
            _this4.waitResPromises[wsMsg.msgId].reject(error);
          } else {
            _this4.waitResPromises[wsMsg.msgId].resolve(evt);
          }
          delete _this4.waitResPromises[wsMsg.msgId];
        } else {
          _this4.events.emit('send', evt);
        }
      });
    };

    _this4.EventEmitter = EventEmitter;
    _this4.options = Object.assign({
      reconnection: true,
      reconnectionDelay: 5000,
      reconnectionAttempts: 12
    }, options);
    _this4.lastReconnect = null;
    _this4.events = new EventEmitter();
    _this4.waitResPromises = {};
    _this4.wsMsgCounter = new Date().getTime();
    _this4.wsPeer.listenNative({
      message: _this4.wsOnMessage,
      error: function error() {},
      close: function close() {}
    });
    return _this4;
  }

  _createClass(WsProtocolApi, [{
    key: 'stopReconnect',
    value: function stopReconnect() {
      if (this.lastReconnect) {
        if (this.lastReconnect.reject) {
          this.lastReconnect.reject();
        }
        this.lastReconnect = null;
      }
    }
  }, {
    key: 'reconnect',
    value: function reconnect(url) {
      var _this5 = this;

      if (this.lastReconnect && this.lastReconnect.promise) {
        return this.lastReconnect.promise;
      }

      this.lastReconnect = this.lastReconnect || {
        time: new Date().getTime(),
        count: 0,
        reject: null
      };

      this.lastReconnect.time = new Date().getTime();
      this.lastReconnect.count++;
      this.lastReconnect.reject = null;

      return this.lastReconnect.promise = (this.lastReconnect.promise || Promise.resolve()).then(function () {
        return _this5._open(url);
      }).then(function () {
        _this5.lastReconnect = null;
      }).catch(function () {
        return new Promise(function (resolve, _reject) {
          if (!_this5.lastReconnect) {
            var message = 'Reconnection interrupted';
            _this5.events.emit('disconnect', {
              reason: message,
              message: message
            });
            return _reject();
          }

          if (_this5.lastReconnect.count > _this5.options.reconnectionAttempts) {
            var _message = 'Reconnection limit exceeded';
            _this5.events.emit('disconnect', {
              reason: _message,
              message: _message
            });
            return _reject();
          }

          var timeout = null;
          var reject = function reject() {
            clearTimeout(timeout);
            _reject();
          };
          timeout = setTimeout(resolve, _this5.options.reconnectionDelay);
          _this5.lastReconnect.reject = reject;
        }).then(function () {
          _this5.lastReconnect && (_this5.lastReconnect.promise = null);
          return _this5.reconnect(url);
        });
      });
    }
  }, {
    key: 'open',
    value: function open(url) {
      return this.reconnect(url);
    }
  }, {
    key: '_open',
    value: function _open(url) {
      var _this6 = this;

      return this.wsPeer.open(url).then(function () {
        return _this6;
      });
    }
  }, {
    key: 'close',
    value: function close() {
      var _this7 = this;

      var message = 'Normal';
      var evt = {
        reason: message,
        message: message
      };
      return this.wsPeer.close().then(function () {
        _this7.events.emit('disconnect', evt);
      }).catch(function (e) {
        _this7.events.emit('disconnect', evt);
        throw e;
      });
    }
  }, {
    key: 'request',
    value: function request(msgConfig, options) {
      return this.sendAndWaitResponse(msgConfig, options);
    }
  }, {
    key: 'sendAndWaitResponse',
    value: function sendAndWaitResponse(msgConfig) {
      var _this8 = this;

      var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref2$timeout = _ref2.timeout,
          timeout = _ref2$timeout === undefined ? 30000 : _ref2$timeout,
          cancelToken = _ref2.cancelToken;

      var msgId = ++this.wsMsgCounter;
      var config = Object.assign({}, msgConfig, { msgId: msgId });
      var msg = new _ws.AzWsMessage(config);

      var cancelable = (0, _makeCancelable2.default)(new Promise(function (resolve, reject) {
        _this8.waitResPromises[msgId] = { resolve: resolve, reject: reject };
        _this8.wsPeer.send(msg.build());
      }), cancelToken);

      setTimeout(function () {
        cancelable.cancel('Request Timeout after ' + timeout + 'ms');
      }, timeout);

      return cancelable.promise;
    }
  }, {
    key: 'nativeEvents',
    get: function get() {
      return this.wsPeer.nativeEvents;
    }
  }]);

  return WsProtocolApi;
}(_apiBase2.default);

exports.default = WsProtocolApi;