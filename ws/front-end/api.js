"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.WebsocketApi = void 0;

var _apiBase = _interopRequireDefault(require("../api-base"));

var _index = require("../../ws/index");

var _makeCancelable = _interopRequireDefault(require("../../utils/makeCancelable"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var WebsocketApi = function () {
  function WebsocketApi() {
    var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var EventEmitter = arguments.length > 1 ? arguments[1] : undefined;

    _classCallCheck(this, WebsocketApi);

    _defineProperty(this, "url", void 0);

    _defineProperty(this, "EventEmitter", void 0);

    _defineProperty(this, "socket", void 0);

    _defineProperty(this, "state", void 0);

    _defineProperty(this, "nativeEvents", void 0);

    _defineProperty(this, "binaryType", void 0);

    _defineProperty(this, "openAsyncInfo", void 0);

    this.url = url;
    this.EventEmitter = EventEmitter;
    this.socket = null;
    this.state = 'closed';
    this.nativeEvents = new EventEmitter();
    this.binaryType = 'arraybuffer';
    this.openAsyncInfo = {
      promise: null
    };
  }

  _createClass(WebsocketApi, [{
    key: "close",
    value: function close(code, reason) {
      if (this.socket) {
        this.openAsyncInfo = {
          promise: null
        };

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
    key: "open",
    value: function open(url) {
      var _this = this;

      if ((!url || this.url === url) && this.state !== 'closed') {
        return this.openAsyncInfo.promise || Promise.resolve();
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
          var _this$openAsyncInfo$r = _this.openAsyncInfo.resolve,
              resolve = _this$openAsyncInfo$r === void 0 ? function () {} : _this$openAsyncInfo$r;
          resolve({
            evt: evt,
            ws: _this
          });
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
          var _this$openAsyncInfo$r2 = _this.openAsyncInfo.reject,
              reject = _this$openAsyncInfo$r2 === void 0 ? function () {} : _this$openAsyncInfo$r2;
          reject({
            evt: evt,
            ws: _this
          });
        }
      };

      this.openAsyncInfo.promise = new Promise(function (resolve, reject) {
        Object.assign(_this.openAsyncInfo, {
          resolve: resolve,
          reject: reject,
          isFulfilled: false
        });
      });
      return this.openAsyncInfo.promise;
    }
  }, {
    key: "send",
    value: function send(msg) {
      if (!this.socket) {
        return Promise.reject(new Error('No Connection'));
      }

      this.socket.send(msg);
      return Promise.resolve();
    }
  }, {
    key: "listenNative",
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
    key: "unlistenNative",
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

exports.WebsocketApi = WebsocketApi;

var WsProtocolApi = function (_WsProtocolApiBase) {
  _inherits(WsProtocolApi, _WsProtocolApiBase);

  function WsProtocolApi() {
    var _this4;

    var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var EventEmitter = arguments.length > 1 ? arguments[1] : undefined;
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, WsProtocolApi);

    _this4 = _possibleConstructorReturn(this, _getPrototypeOf(WsProtocolApi).call(this, new WebsocketApi(url, EventEmitter), {}));

    _defineProperty(_assertThisInitialized(_this4), "EventEmitter", void 0);

    _defineProperty(_assertThisInitialized(_this4), "options", void 0);

    _defineProperty(_assertThisInitialized(_this4), "events", void 0);

    _defineProperty(_assertThisInitialized(_this4), "lastReconnect", void 0);

    _defineProperty(_assertThisInitialized(_this4), "waitResPromises", void 0);

    _defineProperty(_assertThisInitialized(_this4), "wsMsgCounter", void 0);

    _defineProperty(_assertThisInitialized(_this4), "wsOnMessage", function (_ref, ws) {
      var rawData = _ref.data;
      var wsMsg = new _index.AzWsMessage({
        rawData: rawData
      });
      wsMsg.body.json().then(function (data) {
        var evt = {
          rawData: rawData,
          wsMsg: wsMsg,
          data: data
        };

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
    });

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
    var x = _this4.wsPeer;

    _this4.wsPeer.listenNative({
      message: _this4.wsOnMessage,
      error: function error() {},
      close: function close() {}
    });

    return _this4;
  }

  _createClass(WsProtocolApi, [{
    key: "stopReconnect",
    value: function stopReconnect(reason) {
      if (this.lastReconnect) {
        if (this.lastReconnect.reject) {
          this.lastReconnect.reject(reason);
        }

        this.lastReconnect = null;
      }
    }
  }, {
    key: "reconnect",
    value: function reconnect(url) {
      var _this5 = this;

      if (this.lastReconnect && this.lastReconnect.promise) {
        return this.lastReconnect.promise;
      }

      this.lastReconnect = this.lastReconnect || {
        time: new Date().getTime(),
        count: 0,
        promise: null
      };
      this.lastReconnect.time = new Date().getTime();
      this.lastReconnect.count++;
      var p = this.lastReconnect.promise = this.lastReconnect.promise || Promise.resolve();
      delete this.lastReconnect;
      return p.then(function () {
        return _this5._open(url);
      }).then(function () {
        _this5.lastReconnect = null;
      })["catch"](function () {
        return new Promise(function (resolve, _reject) {
          if (!_this5.lastReconnect) {
            var message = 'Reconnection interrupted';

            _this5.events.emit('disconnect', {
              message: message,
              reason: message
            });

            return _reject();
          }

          if (_this5.lastReconnect.count > _this5.options.reconnectionAttempts) {
            var _message = 'Reconnection limit exceeded';

            _this5.events.emit('disconnect', {
              message: _message,
              reason: _message
            });

            return _reject();
          }

          var timeout = 0;

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
    key: "open",
    value: function open(url) {
      return this.reconnect(url);
    }
  }, {
    key: "_open",
    value: function _open(url) {
      var _this6 = this;

      return this.wsPeer.open(url).then(function () {
        return _this6;
      });
    }
  }, {
    key: "close",
    value: function close() {
      var _this7 = this;

      var message = 'Normal';
      var evt = {
        reason: message,
        message: message
      };
      return this.wsPeer.close().then(function () {
        _this7.events.emit('disconnect', evt);
      })["catch"](function (e) {
        _this7.events.emit('disconnect', evt);

        throw e;
      });
    }
  }, {
    key: "request",
    value: function request(msgConfig) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return this.sendAndWaitResponse(msgConfig, options);
    }
  }, {
    key: "sendAndWaitResponse",
    value: function sendAndWaitResponse(msgConfig) {
      var _this8 = this;

      var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref2$timeout = _ref2.timeout,
          timeout = _ref2$timeout === void 0 ? 30000 : _ref2$timeout,
          cancelToken = _ref2.cancelToken;

      var msgId = ++this.wsMsgCounter;
      var config = Object.assign({}, msgConfig, {
        msgId: msgId
      });
      var msg = new _index.AzWsMessage(config);
      var cancelable = (0, _makeCancelable["default"])(new Promise(function (resolve, reject) {
        _this8.waitResPromises[msgId] = {
          resolve: resolve,
          reject: reject
        };

        _this8.wsPeer.send(msg.build());
      }), cancelToken);
      setTimeout(function () {
        cancelable.cancel("Request Timeout after ".concat(timeout, "ms"));
      }, timeout);
      return cancelable.promise;
    }
  }, {
    key: "nativeEvents",
    get: function get() {
      return this.wsPeer.nativeEvents;
    }
  }]);

  return WsProtocolApi;
}(_apiBase["default"]);

exports["default"] = WsProtocolApi;