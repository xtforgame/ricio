'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.ab2str = ab2str;
exports.str2ab = str2ab;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var isNode = new Function('try {return (this===global)&&!(this.navigator&&this.navigator.product===\'ReactNative\');}catch(e){return false;}');
var isBrowser = new Function('try {return this===window;}catch(e){ return false;}');

var BinaryType = ArrayBuffer;
var BufferType = Uint8Array;

var toBuffer = function toBuffer(rawData) {
  if (rawData instanceof BinaryType) {
    return new BufferType(rawData);
  }
  return rawData;
};

var bufferIndexOf = function bufferIndexOf(buffer, str) {
  var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  if (str.length === 0) {
    return start;
  }
  for (var i = start; i < buffer.length - str.length; i++) {
    if (buffer[i] != str.charCodeAt(0)) {
      continue;
    }
    var match = true;
    for (var j = 1; j < str.length; j++) {
      if (buffer[i + j] != str.charCodeAt(j)) {
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
  return String.fromCharCode.apply(null, new Uint8Array(buf));
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
  BinaryType = Buffer;
  BufferType = Buffer;

  toBuffer = function toBuffer(rawData) {
    return rawData;
  };

  bufferToString = function bufferToString(buffer) {
    return buffer.toString();
  };
}

var parseMethodWithPath = function parseMethodWithPath(data) {
  var pos = -1;

  if (typeof data === 'string') {
    pos = data.indexOf('\r\n');
    if (pos >= 0) {
      return [data.substr(0, pos).split(' '), pos + 2];
    }
  } else {
    pos = bufferIndexOf(data, '\r\n');
    if (pos >= 0) {
      return [bufferToString(data.slice(0, pos)).split(' '), pos + 2];
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
  var result = splitHeader(data, start);
  if (!result) {
    return null;
  }
  var retval = {};
  result[0].map(function (text) {
    var pair = text.split(':');
    if (pair.length >= 2) {
      retval[pair[0].toLowerCase()] = pair[1].trim();
    }
  });
  return [retval, result[1]];
};

var parseBody = function parseBody(data, start) {
  var pos = -1;
  var result = null;

  if (typeof data === 'string') {
    return data.substr(start, data.length - start);
  }
  return data.slice(start, data.length);

  return result;
};

var AzWsMsgBody = exports.AzWsMsgBody = function () {
  function AzWsMsgBody() {
    var rawData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    _classCallCheck(this, AzWsMsgBody);

    this.rawData = rawData;
  }

  _createClass(AzWsMsgBody, [{
    key: 'toString',
    value: function toString() {
      return this.rawData.toString();
    }
  }, {
    key: 'getText',
    value: function getText() {
      if (typeof this.rawData === 'string') {
        return this.rawData;
      }
      return bufferToString(this.rawData);
    }
  }, {
    key: 'text',
    value: function text() {
      return Promise.resolve(this.getText());
    }
  }, {
    key: 'getJson',
    value: function getJson() {
      return JSON.parse(this.getText());
    }
  }, {
    key: 'json',
    value: function json() {
      return this.text().then(function (text) {
        try {
          var result = JSON.parse(text);
          return Promise.resolve(result);
        } catch (e) {
          console.log('text :', text);
          return Promise.reject(e);
        }
      });
    }
  }]);

  return AzWsMsgBody;
}();

var AzWsResponse = function () {
  function AzWsResponse(sendHandler, MsgClass, config) {
    _classCallCheck(this, AzWsResponse);

    this.sendHandler = sendHandler;
    this.msg = new MsgClass(config);
  }

  _createClass(AzWsResponse, [{
    key: 'status',
    value: function status(_status) {
      if (!Number.isInteger(_status)) {
        try {
          _status = parseInt(_status);
        } catch (e) {};
      }
      this.msg.status = _status;
      return this;
    }
  }, {
    key: 'lightMsg',
    value: function lightMsg(_lightMsg) {
      this.msg.lightMsg = _lightMsg;
      return this;
    }
  }, {
    key: 'body',
    value: function body(_body) {
      this.msg.body = _body;
      return this;
    }
  }, {
    key: 'build',
    value: function build(body) {
      if (body !== undefined) {
        this.msg.body = body;
      }
      return this.msg.build();
    }
  }, {
    key: 'send',
    value: function send(body, cb) {
      cb = cb || function (err) {
        err && console.log('Failed to send :', err);
      };
      return this.sendHandler.send(this.build(body), cb);
    }
  }, {
    key: 'sendPromise',
    value: function sendPromise(body) {
      return this.sendHandler.sendPromise(this.build(body));
    }
  }, {
    key: 'throw',
    value: function _throw(status, message, _error, options, cb) {
      cb = cb || function (err) {
        err && console.log('Failed to send :', err);
      };
      this.status(status);
      this.lightMsg(message);
      var error = _error || message || 'Internal Server Error';
      return this.sendHandler.send(this.build({ error: error }), cb);
    }
  }, {
    key: 'throwPromise',
    value: function throwPromise(status, message) {
      var error = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'Internal Server Error';
      var options = arguments[3];

      this.status(status);
      this.lightMsg(message);
      return this.sendHandler.sendPromise(this.build({ error: error }));
    }
  }]);

  return AzWsResponse;
}();

exports.AzWsResponse = AzWsResponse;


var msgIdCounter = 0;

var AzWsMessage = exports.AzWsMessage = function () {
  function AzWsMessage(_ref) {
    var _ref$rawData = _ref.rawData,
        rawData = _ref$rawData === undefined ? null : _ref$rawData,
        _ref$method = _ref.method,
        method = _ref$method === undefined ? 'SEND' : _ref$method,
        _ref$path = _ref.path,
        path = _ref$path === undefined ? '/' : _ref$path,
        _ref$url = _ref.url,
        url = _ref$url === undefined ? '/' : _ref$url,
        _ref$status = _ref.status,
        status = _ref$status === undefined ? null : _ref$status,
        _ref$lightMsg = _ref.lightMsg,
        lightMsg = _ref$lightMsg === undefined ? null : _ref$lightMsg,
        _ref$msgId = _ref.msgId,
        msgId = _ref$msgId === undefined ? null : _ref$msgId,
        _ref$headers = _ref.headers,
        headers = _ref$headers === undefined ? {} : _ref$headers,
        _ref$body = _ref.body,
        body = _ref$body === undefined ? '' : _ref$body,
        _ref$peerInfo = _ref.peerInfo,
        peerInfo = _ref$peerInfo === undefined ? { ws: null, server: null } : _ref$peerInfo,
        _ref$local = _ref.local,
        local = _ref$local === undefined ? {} : _ref$local;

    _classCallCheck(this, AzWsMessage);

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

    if (rawData) {
      this.parseRawData(rawData);
    }
  }

  _createClass(AzWsMessage, [{
    key: 'parseRawData',
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

      var parseResult = parseMethodWithPath(this.rawData);
      if (!parseResult) {
        console.log('parseResult :', this.rawData);
        return;
      }

      this.method = parseResult[0][0];
      this.path = parseResult[0][1];
      this.msgId = parseResult[0][2] || null;
      this.status = parseResult[0][3] || null;
      if (this.status) {
        try {
          this.status = parseInt(this.status);
        } catch (e) {};
      }
      this.lightMsg = parseResult[0][4] || null;
      var headerStart = parseResult[1];

      parseResult = parseHeaders(this.rawData, headerStart);
      if (!parseResult) {
        console.log('parseResult1 :', this.rawData);
        return;
      }

      this.headers = parseResult[0];
      var bodyStart = parseResult[1];

      this.body = new AzWsMsgBody(parseBody(this.rawData, bodyStart));
      this.valid = true;
    }
  }, {
    key: 'build',
    value: function build() {
      var _this = this;

      var result = this.method.toUpperCase() + ' ' + this.path + ' ' + (this.msgId || ++msgIdCounter) + ' ' + (this.status || '') + ' ' + (this.lightMsg || '') + '\r\n';
      Object.keys(this.headers).map(function (key) {
        result += key + ': ' + _this.headers[key] + '\r\n';
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
    key: 'genResponse',
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