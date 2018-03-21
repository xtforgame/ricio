'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

var _ws3 = require('../ws');

var _RicioPeer = require('../RicioPeer');

var _RicioPeer2 = _interopRequireDefault(_RicioPeer);

var _api = require('../ws/server/api');

var _api2 = _interopRequireDefault(_api);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function createContext(server, ws, rcPeer, _ref) {
  var _ref$peerInfo = _ref.peerInfo,
      _peerInfo = _ref$peerInfo === undefined ? {} : _ref$peerInfo,
      rawData = _ref.rawData,
      options = _objectWithoutProperties(_ref, ['peerInfo', 'rawData']);

  var peerInfo = _extends({}, _peerInfo, {
    server: server,
    ws: ws,
    userData: { rcPeer: rcPeer }
  });

  var msg = new _ws3.AzWsMessage(_extends({
    path: rawData ? undefined : '/',
    rawData: rawData
  }, options, {
    peerInfo: peerInfo
  }));

  msg.rcPeer = rcPeer;
  msg.rcResponse = msg.rcPeer.response || msg.genResponse({
    send: function send(data) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      return new Promise(function (resolve, reject) {
        var cb = function cb(error) {
          if (error) {
            reject(error);
          }
          resolve(null);
        };
        ws.send(data, options, cb);
      });
    }
  });
  return msg;
}

var WsServer = function () {
  function WsServer(callback) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, WsServer);

    this.callback = callback;

    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    this.server = new (Function.prototype.bind.apply(_ws2.default.Server, [null].concat(args)))();
    this.bind(options);
  }

  _createClass(WsServer, [{
    key: 'on',
    value: function on() {
      var _server;

      return (_server = this.server).on.apply(_server, arguments);
    }
  }, {
    key: 'bind',
    value: function bind(_ref2) {
      var userSessionManager = _ref2.userSessionManager,
          _ref2$PeerClass = _ref2.PeerClass,
          PeerClass = _ref2$PeerClass === undefined ? _RicioPeer2.default : _ref2$PeerClass;

      var _this = this;

      var onError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (ctx) {};
      var onNoMatch = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (ctx) {};

      this.on('connection', function (wsObj) {
        var rcPeer = new PeerClass(userSessionManager, {
          protocol: {
            type: 'ws',
            api: new _api2.default(wsObj, userSessionManager.allPeers)
          }
        });

        wsObj.on('open', function () {
          var ctx = createContext(_this, wsObj, rcPeer, {
            method: 'OPEN'
          });
          _this.callback(ctx);
        });

        wsObj.on('message', function (data, flag) {
          var ctx = createContext(_this, wsObj, rcPeer, {
            method: 'MESSAGE',
            peerInfo: { data: data, flag: flag }
          });


          ctx = createContext(_this, wsObj, rcPeer, {
            rawData: data,
            peerInfo: { data: data, flag: flag }
          });

          _this.callback(ctx);
        });

        wsObj.on('close', function (code, reason) {
          var ctx = createContext(_this, wsObj, rcPeer, {
            method: 'CLOSE',
            peerInfo: { code: code, reason: reason }
          });
          _this.callback(ctx);
        });

        wsObj.on('error', function (error) {
          var ctx = createContext(_this, wsObj, rcPeer, {
            method: 'ERROR',
            peerInfo: { error: error }
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

exports.default = WsServer;