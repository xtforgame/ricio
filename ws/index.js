"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ab2str = ab2str;
exports.str2ab = str2ab;
exports.AzWsMessage = exports.AzWsResponse = exports.AzWsMsgBody = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var isNode = new Function('try {return (this===global)&&!(this.navigator&&this.navigator.product===\'ReactNative\');}catch(e){return false;}');
var WsBinary = ArrayBuffer;
var WsBuffer = Uint8Array;

var toBuffer = function toBuffer(rawData) {
  if (rawData instanceof WsBinary) {
    return new WsBuffer(rawData);
  }

  return rawData;
};

var bufferIndexOf = function bufferIndexOf(buffer, str) {
  var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  if (str.length === 0) {
    return start;
  }

  for (var i = start; i < buffer.length - str.length; i++) {
    if (buffer[i] !== str.charCodeAt(0)) {
      continue;
    }

    var match = true;

    for (var j = 1; j < str.length; j++) {
      if (buffer[i + j] !== str.charCodeAt(j)) {
        match = false;
        break;
      }
    }

    if (match) {
      return i;
    }
  }

  return -1;
};

function ab2str(buf) {
  return String.fromCharCode.apply(null, new WsBuffer(buf));
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length);
  var bufView = new Uint8Array(buf);

  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }

  return buf;
}

var bufferToString = ab2str;

if (isNode()) {
  WsBinary = Buffer;
  WsBuffer = Buffer;

  toBuffer = function toBuffer(rawData) {
    return rawData;
  };

  bufferToString = function bufferToString(buffer) {
    return buffer.toString();
  };
}

var parseMethodWithPath = function parseMethodWithPath(data) {
  if (!data) {
    return null;
  }

  var pos = -1;

  if (typeof data === 'string') {
    var d = data;
    pos = d.indexOf('\r\n');

    if (pos >= 0) {
      return [d.substr(0, pos).split(' '), pos + 2];
    }
  } else {
    var _d = data;
    pos = bufferIndexOf(_d, '\r\n');

    if (pos >= 0) {
      return [bufferToString(_d.slice(0, pos)).split(' '), pos + 2];
    }
  }

  return null;
};

var splitHeader = function splitHeader(data, start) {
  var pos = -1;

  if (typeof data === 'string') {
    pos = data.indexOf('\r\n\r\n', start - 2);

    if (pos >= 0) {
      return [data.substr(start, pos - start).split('\r\n'), pos + 4];
    }
  } else {
    pos = bufferIndexOf(data, '\r\n\r\n', start - 2);

    if (pos >= 0) {
      return [bufferToString(data.slice(start, pos)).split('\r\n'), pos + 4];
    }
  }

  return null;
};

var parseHeaders = function parseHeaders(data, start) {
  if (!data) {
    return null;
  }

  var result = splitHeader(data, start);

  if (!result) {
    return null;
  }

  var retval = {};
  result[0].forEach(function (text) {
    var pair = text.split(':');

    if (pair.length >= 2) {
      retval[pair[0].toLowerCase()] = pair[1].trim();
    }
  });
  return [retval, result[1]];
};

var parseBody = function parseBody(data, start) {
  if (typeof data === 'string') {
    return data.substr(start, data.length - start);
  }

  return data.slice(start, data.length);
};

var AzWsMsgBody = function () {
  function AzWsMsgBody() {
    var rawData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    _classCallCheck(this, AzWsMsgBody);

    _defineProperty(this, "rawData", void 0);

    this.rawData = rawData;
  }

  _createClass(AzWsMsgBody, [{
    key: "toString",
    value: function toString() {
      if (!this.rawData) {
        return '';
      }

      return this.rawData.toString();
    }
  }, {
    key: "getText",
    value: function getText() {
      if (typeof this.rawData === 'string') {
        return this.rawData;
      }

      return bufferToString(this.rawData);
    }
  }, {
    key: "text",
    value: function text() {
      return Promise.resolve(this.getText());
    }
  }, {
    key: "getJson",
    value: function getJson() {
      return JSON.parse(this.getText());
    }
  }, {
    key: "json",
    value: function json() {
      return this.text().then(function (text) {
        try {
          var result = JSON.parse(text);
          return Promise.resolve(result);
        } catch (e) {
          return Promise.reject(e);
        }
      });
    }
  }]);

  return AzWsMsgBody;
}();

exports.AzWsMsgBody = AzWsMsgBody;

var AzWsResponse = function () {
  function AzWsResponse(sendHandler, MsgClass, config) {
    _classCallCheck(this, AzWsResponse);

    _defineProperty(this, "sendHandler", void 0);

    _defineProperty(this, "msg", void 0);

    this.sendHandler = sendHandler;
    this.msg = new MsgClass(config);
  }

  _createClass(AzWsResponse, [{
    key: "status",
    value: function status(_status) {
      var s = _status;

      if (!Number.isInteger(_status)) {
        try {
          s = parseInt(_status);
        } catch (e) {}
      }

      this.msg.status = s;
      return this;
    }
  }, {
    key: "lightMsg",
    value: function lightMsg(_lightMsg) {
      this.msg.lightMsg = _lightMsg;
      return this;
    }
  }, {
    key: "body",
    value: function body(_body) {
      this.msg.body = _body;
      return this;
    }
  }, {
    key: "build",
    value: function build(body) {
      if (body !== undefined) {
        this.msg.body = body;
      }

      return this.msg.build();
    }
  }, {
    key: "send",
    value: function send(body, cb) {
      return this.sendHandler.send(this.build(body), cb || function (err) {
        if (err) {
          console.error('Failed to send :', err);
        }
      });
    }
  }, {
    key: "sendPromise",
    value: function sendPromise(body) {
      return this.sendHandler.sendPromise(this.build(body));
    }
  }, {
    key: "throw",
    value: function _throw(status, message, _error, options, cb) {
      this.status(status);
      this.lightMsg(message);
      var error = _error || message || 'Internal Server Error';
      return this.sendHandler.send(this.build({
        error: error
      }), cb || function (err) {
        if (err) {
          console.error('Failed to send :', err);
        }
      });
    }
  }, {
    key: "throwPromise",
    value: function throwPromise(status, message) {
      var error = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'Internal Server Error';
      var options = arguments.length > 3 ? arguments[3] : undefined;
      this.status(status);
      this.lightMsg(message);
      return this.sendHandler.sendPromise(this.build({
        error: error
      }));
    }
  }]);

  return AzWsResponse;
}();

exports.AzWsResponse = AzWsResponse;
var msgIdCounter = 0;

var AzWsMessage = function () {
  function AzWsMessage(_ref) {
    var _ref$rawData = _ref.rawData,
        rawData = _ref$rawData === void 0 ? null : _ref$rawData,
        _ref$method = _ref.method,
        method = _ref$method === void 0 ? 'SEND' : _ref$method,
        _ref$path = _ref.path,
        path = _ref$path === void 0 ? '/' : _ref$path,
        _ref$url = _ref.url,
        url = _ref$url === void 0 ? '/' : _ref$url,
        _ref$status = _ref.status,
        status = _ref$status === void 0 ? null : _ref$status,
        _ref$lightMsg = _ref.lightMsg,
        lightMsg = _ref$lightMsg === void 0 ? null : _ref$lightMsg,
        _ref$msgId = _ref.msgId,
        msgId = _ref$msgId === void 0 ? null : _ref$msgId,
        _ref$headers = _ref.headers,
        headers = _ref$headers === void 0 ? {} : _ref$headers,
        _ref$body = _ref.body,
        body = _ref$body === void 0 ? '' : _ref$body,
        _ref$peerInfo = _ref.peerInfo,
        peerInfo = _ref$peerInfo === void 0 ? {
      ws: null,
      server: null
    } : _ref$peerInfo,
        _ref$local = _ref.local,
        local = _ref$local === void 0 ? {} : _ref$local;

    _classCallCheck(this, AzWsMessage);

    _defineProperty(this, "protocol", void 0);

    _defineProperty(this, "rawData", void 0);

    _defineProperty(this, "method", void 0);

    _defineProperty(this, "path", void 0);

    _defineProperty(this, "msgId", void 0);

    _defineProperty(this, "status", void 0);

    _defineProperty(this, "lightMsg", void 0);

    _defineProperty(this, "headers", void 0);

    _defineProperty(this, "body", void 0);

    _defineProperty(this, "params", void 0);

    _defineProperty(this, "query", void 0);

    _defineProperty(this, "local", void 0);

    _defineProperty(this, "peerInfo", void 0);

    _defineProperty(this, "valid", void 0);

    this.protocol = 'ws';
    this.rawData = rawData;
    this.method = method;
    this.path = path || url;
    this.msgId = msgId;
    this.status = status;
    this.lightMsg = lightMsg;
    this.headers = headers;
    this.body = body;
    this.params = {};
    this.query = {};
    this.local = local;
    this.peerInfo = peerInfo;
    this.valid = true;

    if (this.rawData) {
      this.parseRawData(this.rawData);
    }
  }

  _createClass(AzWsMessage, [{
    key: "parseRawData",
    value: function parseRawData(rawData) {
      this.rawData = toBuffer(rawData);
      this.method = null;
      this.path = null;
      this.msgId = null;
      this.status = null;
      this.lightMsg = null;
      this.headers = {};
      this.body = null;
      this.valid = true;
      var mplParseResult = parseMethodWithPath(this.rawData);

      if (!mplParseResult) {
        console.error('mplParseResult :', this.rawData);
        return;
      }

      this.method = mplParseResult[0][0];
      this.path = mplParseResult[0][1];
      this.msgId = mplParseResult[0][2] || null;
      this.status = mplParseResult[0][3] || null;

      if (this.status) {
        try {
          this.status = parseInt(this.status);
        } catch (e) {}
      }

      this.lightMsg = mplParseResult[0][4] || null;
      var headerStart = mplParseResult[1];
      var parseResult = parseHeaders(this.rawData, headerStart);

      if (!parseResult) {
        console.error('parseResult1 :', this.rawData);
        return;
      }

      this.headers = parseResult[0];
      var bodyStart = parseResult[1];
      this.body = new AzWsMsgBody(parseBody(this.rawData, bodyStart));
      this.valid = true;
    }
  }, {
    key: "build",
    value: function build() {
      var _this = this;

      var result = "".concat(this.method.toUpperCase(), " ").concat(this.path, " ").concat(this.msgId || ++msgIdCounter, " ").concat(this.status || '', " ").concat(this.lightMsg || '', "\r\n");
      Object.keys(this.headers).forEach(function (key) {
        result += "".concat(key, ": ").concat(_this.headers[key], "\r\n");
      });
      result += '\r\n';

      if (this.body) {
        if (typeof this.body === 'string') {
          result += this.body;
        } else {
          try {
            result += JSON.stringify(this.body);
          } catch (e) {}
        }
      }

      return result;
    }
  }, {
    key: "genResponse",
    value: function genResponse(sendHandler) {
      return new AzWsResponse(sendHandler, AzWsMessage, {
        status: 200,
        lightMsg: 'OK',
        method: 'RESPONSE',
        path: this.path,
        msgId: this.msgId
      });
    }
  }]);

  return AzWsMessage;
}();

exports.AzWsMessage = AzWsMessage;