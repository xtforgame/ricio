"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var RicioPeer = function () {
  function RicioPeer(userSessionManager, option) {
    var _this = this;

    _classCallCheck(this, RicioPeer);

    _defineProperty(this, "protocol", void 0);

    _defineProperty(this, "api", void 0);

    _defineProperty(this, "userSessionManager", void 0);

    _defineProperty(this, "session", void 0);

    _defineProperty(this, "sessionId", void 0);

    _defineProperty(this, "managedSession", void 0);

    _defineProperty(this, "send", function (msg) {
      return _this.api.send(msg)["catch"](function (e) {
        console.log('RicioPeer Send Error :', e);
      });
    });

    if (!option.protocol) {
      throw new Error('<RicioPeer>: No option.protocol provided.');
    }

    this.protocol = option.protocol;
    this.api = option.protocol.api;
    this.userSessionManager = userSessionManager;
  }

  _createClass(RicioPeer, [{
    key: "getWsPeer",
    value: function getWsPeer() {
      return this.api.wsPeer;
    }
  }, {
    key: "getSession",
    value: function getSession() {
      return this.session;
    }
  }, {
    key: "getSessionId",
    value: function getSessionId() {
      return this.sessionId;
    }
  }, {
    key: "setSession",
    value: function setSession(managedSession) {
      this.managedSession = managedSession;
      this.sessionId = managedSession.uid;
      this.session = managedSession.data.session;
    }
  }, {
    key: "getUser",
    value: function getUser() {
      return this.managedSession && this.managedSession.user;
    }
  }]);

  return RicioPeer;
}();

exports["default"] = RicioPeer;