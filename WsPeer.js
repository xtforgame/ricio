"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EmptyWsPeer = exports.EmptyWsPeerManager = void 0;

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var EmptyWsPeerManager = function EmptyWsPeerManager() {
  _classCallCheck(this, EmptyWsPeerManager);

  _defineProperty(this, "wsPeerMap", void 0);

  this.wsPeerMap = new Map();
};

exports.EmptyWsPeerManager = EmptyWsPeerManager;

var EmptyWsPeer = function () {
  function EmptyWsPeer() {
    _classCallCheck(this, EmptyWsPeer);
  }

  _createClass(EmptyWsPeer, [{
    key: "send",
    value: function send() {}
  }]);

  return EmptyWsPeer;
}();

exports.EmptyWsPeer = EmptyWsPeer;