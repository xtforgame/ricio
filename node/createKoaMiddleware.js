"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _RicioPeer = _interopRequireDefault(require("../RicioPeer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function createContext(ctx, rcPeer) {
  ctx.rcPeer = rcPeer;
  ctx.rcResponse = {
    send: function send(body) {
      ctx.body = body;
    },
    sendPromise: function sendPromise(body) {
      ctx.body = body;
      return Promise.resolve();
    },
    "throw": function _throw(status, message, optioins) {
      ctx["throw"](status, message, optioins);
    }
  };
  return ctx;
}

var _default = function _default(userSessionManager) {
  var PeerClass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _RicioPeer["default"];
  return function (ctx, next) {
    var webhookUrl = ctx.request.headers['x-ricio-webhook-url'];
    var rcPeer = new PeerClass(userSessionManager, {
      protocol: {
        type: 'http',
        api: {
          send: function send(msg) {
            if (!webhookUrl) {
              return Promise.reject(new Error('No "x-ricio-webhook-url" header provided'));
            }

            return (0, _axios["default"])({
              method: 'post',
              url: webhookUrl,
              data: msg.body
            }).then(function (res) {
              return res.data;
            });
          }
        }
      }
    });
    createContext(ctx, rcPeer);
    return next();
  };
};

exports["default"] = _default;