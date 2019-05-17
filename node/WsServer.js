"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _ws = require("ws");

var _RicioPeer = _interopRequireDefault(require("../RicioPeer"));

var _api = _interopRequireWildcard(require("../ws/server/api"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function createContext(server, ws, rcPeer, _ref) {
  var method = _ref.method,
      _ref$peerInfo = _ref.peerInfo,
      _peerInfo = _ref$peerInfo === void 0 ? {} : _ref$peerInfo,
      _ref$rawData = _ref.rawData,
      rawData = _ref$rawData === void 0 ? null : _ref$rawData,
      options = _objectWithoutProperties(_ref, ["method", "peerInfo", "rawData"]);

  var peerInfo = _objectSpread({}, _peerInfo, {
    server: server,
    ws: ws,
    userData: {
      rcPeer: rcPeer
    }
  });

  var msg = new _api.AzWsMessageCtx(_objectSpread({
    path: rawData ? undefined : '/',
    rawData: rawData
  }, options, {
    peerInfo: peerInfo
  }), rcPeer);

  var send = function send(data) {
    return new Promise(function (resolve, reject) {
      var cb = function cb(error) {
        if (error) {
          return reject(error);
        }

        return resolve(null);
      };

      ws.send(data, cb);
    });
  };

  msg.rcResponse = msg.rcResponse || msg.genResponse({
    send: send,
    sendPromise: send
  });
  return msg;
}

var WsServer = function () {
  function WsServer(callback, options) {
    _classCallCheck(this, WsServer);

    _defineProperty(this, "callback", void 0);

    _defineProperty(this, "server", void 0);

    this.callback = callback;

    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    this.server = _construct(_ws.Server, args);
    this.bind(options);
  }

  _createClass(WsServer, [{
    key: "on",
    value: function on(eventName, cb) {
      return this.server.on(eventName, cb);
    }
  }, {
    key: "bind",
    value: function bind(_ref2) {
      var _this = this;

      var rcPeerManager = _ref2.rcPeerManager,
          _ref2$PeerClass = _ref2.PeerClass,
          PeerClass = _ref2$PeerClass === void 0 ? _RicioPeer["default"] : _ref2$PeerClass;
      var onError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (ctx) {};
      var onNoMatch = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (ctx) {};
      this.on('connection', function (wsObj) {
        var rcPeer = new PeerClass(rcPeerManager, {
          protocol: {
            type: 'ws',
            api: new _api["default"](wsObj, rcPeerManager.wsPeerManager)
          }
        });
        wsObj.on('open', function () {
          var ctx = createContext(_this, wsObj, rcPeer, {
            method: 'OPEN'
          });

          _this.callback(ctx);
        });
        wsObj.on('message', function (data) {
          var ctx = createContext(_this, wsObj, rcPeer, {
            method: 'MESSAGE',
            peerInfo: {
              data: data
            }
          });
          ctx = createContext(_this, wsObj, rcPeer, {
            method: '',
            rawData: data,
            peerInfo: {
              data: data
            }
          });

          _this.callback(ctx);
        });
        wsObj.on('close', function (code, reason) {
          var ctx = createContext(_this, wsObj, rcPeer, {
            method: 'CLOSE',
            peerInfo: {
              code: code,
              reason: reason
            }
          });

          _this.callback(ctx);
        });
        wsObj.on('error', function (error) {
          var ctx = createContext(_this, wsObj, rcPeer, {
            method: 'ERROR',
            peerInfo: {
              error: error
            }
          });

          _this.callback(ctx);
        });
        var ctx = createContext(_this, wsObj, rcPeer, {
          method: 'CONNECT'
        });

        _this.callback(ctx);
      });
    }
  }]);

  return WsServer;
}();

exports["default"] = WsServer;