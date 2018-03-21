'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RicioPeer = function () {
  function RicioPeer(userSessionManager, option) {
    var _this = this;

    _classCallCheck(this, RicioPeer);

    this.send = function (msg) {
      return _this.protocol.api.send(msg).catch(function (e) {
        console.log('RicioPeer Send Error :', e);
      });
    };

    if (!option.protocol) {
      throw new Error('<RicioPeer>: No option.protocol provided.');
    }
    this.protocol = option.protocol;
    this.api = option.protocol.api;
    this.userSessionManager = userSessionManager;
  }

  _createClass(RicioPeer, [{
    key: 'getWsPeer',
    value: function getWsPeer() {
      return this.api.wsPeer;
    }
  }, {
    key: 'getSession',
    value: function getSession() {
      return this.session;
    }
  }, {
    key: 'getSessionId',
    value: function getSessionId() {
      return this.sessionId;
    }
  }, {
    key: 'setSession',
    value: function setSession(managedSession) {
      this.managedSession = managedSession;
      this.sessionId = managedSession.uid;
      this.session = managedSession.data.session;
    }
  }, {
    key: 'getUser',
    value: function getUser() {
      return this.managedSession && this.managedSession.user;
    }
  }]);

  return RicioPeer;
}();

exports.default = RicioPeer;