'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ws = require('../ws');

var _RicioPeer = require('../RicioPeer');

var _RicioPeer2 = _interopRequireDefault(_RicioPeer);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createContext(ctx, rcPeer) {
  ctx.rcPeer = rcPeer;
  ctx.rcResponse = {
    send: function send(msg) {
      ctx.body = msg;
    },
    throw: function _throw(statusCode, message, optioins) {
      ctx.throw(statusCode, message, optioins);
    }
  };
  return ctx;
}

exports.default = function (userSessionManager) {
  var PeerClass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _RicioPeer2.default;
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
            return (0, _axios2.default)({
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