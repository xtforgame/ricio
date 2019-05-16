"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.CancelToken = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var CancelToken = function () {
  function CancelToken() {
    _classCallCheck(this, CancelToken);

    _defineProperty(this, "canceled", void 0);

    _defineProperty(this, "cancelReason", void 0);

    _defineProperty(this, "cancelFunc", void 0);

    this.canceled = false;
    this.cancelReason = null;
    this.cancelFunc = null;
  }

  _createClass(CancelToken, [{
    key: "setHandled",
    value: function setHandled() {
      this.canceled = true;
    }
  }, {
    key: "setCancelFunc",
    value: function setCancelFunc(cancelFunc) {
      this.cancelFunc = cancelFunc;

      if (this.canceled) {
        this.cancelFunc(this.cancelReason);
      }
    }
  }, {
    key: "cancel",
    value: function cancel(reason) {
      if (this.canceled) {
        return;
      }

      this.cancelReason = reason;

      if (this.cancelFunc) {
        this.cancelFunc(this.cancelReason);
      }

      this.setHandled();
    }
  }]);

  return CancelToken;
}();

exports.CancelToken = CancelToken;

var _default = function _default(promise, cancelToken) {
  var handled = false;
  var needCancel = false;
  var cancelReason = null;
  var rejectFuc = null;
  var wrappedPromise = new Promise(function (resolve, reject) {
    rejectFuc = reject;
    promise.then(function (val) {
      if (handled) return;
      handled = true;
      needCancel ? reject({
        cancelReason: cancelReason,
        isCanceled: true
      }) : resolve(val);
    })["catch"](function (error) {
      if (handled) return;
      handled = true;
      needCancel ? reject({
        cancelReason: cancelReason,
        isCanceled: true
      }) : reject(error);
    });
  });

  var cancel = function cancel(reason) {
    if (handled) return;

    if (rejectFuc) {
      rejectFuc({
        cancelReason: reason,
        isCanceled: true
      });
      handled = true;
    } else {
      cancelReason = reason;
      needCancel = true;
    }

    cancelToken && cancelToken.setHandled();
  };

  cancelToken && cancelToken.setCancelFunc(cancel);
  return {
    cancel: cancel,
    promise: wrappedPromise
  };
};

exports["default"] = _default;