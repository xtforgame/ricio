/* eslint-disable no-new-func, prefer-destructuring */
const isNode = new Function('try {return (this===global)&&!(this.navigator&&this.navigator.product===\'ReactNative\');}catch(e){return false;}');
// const isBrowser = new Function('try {return this===window;}catch(e){ return false;}');

export type Protocol = string | null;

export type Method = string | null;
export type Url = string | null;
export type Path = string | null;
export type MsgId = any;

export type HeaderMap = { [s: string]: string; };
export type Status = string | number | null;
export type LightMsg = string | null;

export type PlainBody = Object | string | AzWsMsgBody | null;
export type Body = PlainBody | AzWsMsgBody;

export type NormalizedRawData = BufferType | null;
export type RawData = BinaryType | NormalizedRawData;

export type Params = { [s: string]: any; };
export type Query = { [s: string]: any; };
export type Local = { [s: string]: any; };

export interface WsPeerInfo {
  server : any;
  ws : any;
  [s : string] : any;
}

export interface BinaryType {
  length : number;
}

export interface BufferType {
  [index: number]: number;
  slice : (start : number, end : number) => BufferType;
  length : number;
}

export interface SendHandler {
  send : Function;
  sendPromise : Function;
}

export interface WsMessage {
  status : Status;
  lightMsg : LightMsg;
  body : Body;
  build : Function;
}

export interface WsMessageConfig {
  protocol? : Protocol;
  rawData? : RawData;
  method? : Method;
  url? : Url;
  path? : Path;
  msgId? : MsgId;
  status? : Status;
  lightMsg? : LightMsg;
  headers? : HeaderMap;
  body? : Body;
  params? : Params;
  query? : Query;
  local? : Local;
  peerInfo? : WsPeerInfo;
}

export interface WsMessageClass {
  new (config : WsMessageConfig): WsMessage;
}

let WsBinary : any = ArrayBuffer;
let WsBuffer : any = Uint8Array;

let toBuffer = (rawData : BinaryType) => {
  if (rawData instanceof WsBinary) {
    return new WsBuffer(rawData);
  }
  return rawData;
};

const bufferIndexOf = (buffer : BufferType, str : string, start = 0) => {
  if (str.length === 0) {
    return start;
  }
  for (let i = start; i < buffer.length - str.length; i++) {
    if (buffer[i] !== str.charCodeAt(0)) {
      continue;
    }
    let match = true;
    for (let j = 1; j < str.length; j++) {
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

export function ab2str(buf : BufferType) {
  return String.fromCharCode.apply(null, new WsBuffer(buf));
}

export function str2ab(str : string) {
  const buf = new ArrayBuffer(str.length); // 2 bytes for each char
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

let bufferToString = ab2str;

if (isNode()) {
  WsBinary = Buffer;
  WsBuffer = Buffer;

  toBuffer = rawData => rawData;

  bufferToString = buffer => buffer.toString();
}

const parseMethodWithPath = (data : NormalizedRawData) : [string[], number] | null => {
  if (!data) {
    return null;
  }
  let pos = -1;

  if (typeof data === 'string') {
    const d = (<string>data);
    pos = d.indexOf('\r\n');
    if (pos >= 0) {
      return [d.substr(0, pos).split(' '), pos + 2];
    }
  } else {
    const d = (<BufferType>data);
    pos = bufferIndexOf(d, '\r\n');
    if (pos >= 0) {
      return [bufferToString(d.slice(0, pos)).split(' '), pos + 2];
    }
  }
  return null;
};

const splitHeader = (data : string | BufferType, start : number) : [string[], number] | null => {
  let pos = -1;

  if (typeof data === 'string') {
    pos = data.indexOf('\r\n\r\n', start - 2);
    if (pos >= 0) {
      // if(pos == start - 2){
      //   return [[], pos + 4];
      // }
      return [data.substr(start, pos - start).split('\r\n'), pos + 4];
    }
  } else {
    pos = bufferIndexOf(data, '\r\n\r\n', start - 2);
    if (pos >= 0) {
      // if(pos == start - 2){
      //   return [[], pos + 4];
      // }
      return [bufferToString(data.slice(start, pos)).split('\r\n'), pos + 4];
    }
  }
  return null;
};

const parseHeaders = (data : string | BufferType | null, start : number) : [HeaderMap, number] | null => {
  if (!data) {
    return null;
  }
  const result = splitHeader(data, start);
  if (!result) {
    return null;
  }
  const retval : HeaderMap = {};
  result[0].forEach((text) => {
    const pair = text.split(':');
    if (pair.length >= 2) {
      retval[pair[0].toLowerCase()] = pair[1].trim();
    }
  });
  return [retval, result[1]];
};

const parseBody = (data : string | BufferType, start : number) => {
  if (typeof data === 'string') {
    return data.substr(start, data.length - start);
  }
  return data.slice(start, data.length);
};

// console.log('isNode() :', isNode());

export class AzWsMsgBody {
  rawData : NormalizedRawData;

  constructor(rawData : any = null) {
    this.rawData = rawData;
  }

  toString() {
    if (!this.rawData) {
      return '';
    }
    return (<BufferType>this.rawData).toString();
  }

  getText() {
    if (typeof this.rawData === 'string') {
      return this.rawData;
    }
    return bufferToString(<BufferType>this.rawData);
  }

  text() {
    return Promise.resolve(this.getText());
  }

  getJson() {
    return JSON.parse(this.getText());
  }

  json() {
    return this.text()
      .then((text) => {
        // console.log('text :', text);
        try {
          const result = JSON.parse(text);
          return Promise.resolve(result);
        } catch (e) {
          // console.log('text :', text);
          return Promise.reject(e);
        }
      });
  }
}

export class AzWsResponse {
  sendHandler : SendHandler;
  msg : WsMessage;

  constructor(sendHandler : SendHandler, MsgClass : WsMessageClass, config : WsMessageConfig) {
    this.sendHandler = sendHandler;
    this.msg = new MsgClass(config);
  }

  status(status : Status) {
    let s = status;
    if (!Number.isInteger(<number>status)) {
      try {
        s = parseInt(<string>status);
      } catch (e) {
        //
      }
    }
    this.msg.status = s;
    return this;
  }

  lightMsg(lightMsg : LightMsg) {
    this.msg.lightMsg = lightMsg;
    return this;
  }

  body(body : Body) {
    this.msg.body = body;
    return this;
  }

  build(body : Body) {
    if (body !== undefined) {
      this.msg.body = body;
    }
    return this.msg.build();
  }

  send(body : Body, cb : Function) {
    return this.sendHandler.send(this.build(body), cb || ((err : any) => {
      if (err) {
        console.error('Failed to send :', err);
      }
    }));
  }

  sendPromise(body : Body) : Promise<any> {
    return this.sendHandler.sendPromise(this.build(body));
  }

  throw(status : Status, message : LightMsg, _error? : any, options? : any, cb? : Function) {
    this.status(status);
    this.lightMsg(message);
    const error = _error || message || 'Internal Server Error';
    return this.sendHandler.send(this.build({ error }), cb || ((err : any) => {
      if (err) {
        console.error('Failed to send :', err);
      }
    }));
  }

  throwPromise(status : Status, message : LightMsg, error : any = 'Internal Server Error', options? : any) {
    this.status(status);
    this.lightMsg(message);
    return this.sendHandler.sendPromise(this.build({ error }));
  }
}

let msgIdCounter = 0;

export class AzWsMessage implements WsMessage {
  protocol : Protocol;
  rawData : RawData;
  method : Method;
  path : Path;
  msgId : MsgId;
  status : Status;
  lightMsg : LightMsg;
  headers : HeaderMap;
  body : Body;
  params : Params;
  query : Query;
  local : Local;

  peerInfo : WsPeerInfo;

  valid : boolean;

  constructor({
    rawData = null,
    method = 'SEND',
    path = '/',
    url = '/',
    status = null,
    lightMsg = null,
    msgId = null,
    headers = {},
    body = '',
    peerInfo = { ws: null, server: null },
    local = {},
  } : WsMessageConfig) {
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

  parseRawData(rawData : BinaryType) {
    this.rawData = toBuffer(rawData);
    this.method = null;
    this.path = null;
    this.msgId = null;
    this.status = null;
    this.lightMsg = null;
    this.headers = {};
    this.body = null;
    this.valid = true;

    const mplParseResult = parseMethodWithPath(<BufferType>this.rawData);
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
      } catch (e) {
        //
      }
    }
    this.lightMsg = mplParseResult[0][4] || null;
    const headerStart = mplParseResult[1];

    const parseResult = parseHeaders(<BufferType>this.rawData, headerStart);
    if (!parseResult) {
      console.error('parseResult1 :', this.rawData);
      return;
    }

    this.headers = parseResult[0];
    const bodyStart = parseResult[1];

    this.body = new AzWsMsgBody(parseBody(<BufferType>this.rawData, bodyStart));
    this.valid = true;
  }

  build() {
    let result = `${(<string>this.method).toUpperCase()} ${this.path} ${this.msgId || ++msgIdCounter} ${this.status || ''} ${this.lightMsg || ''}\r\n`;
    Object.keys(this.headers).forEach((key) => {
      result += `${key}: ${this.headers[key]}\r\n`;
    });
    result += '\r\n';
    if (this.body) {
      if (typeof this.body === 'string') {
        result += this.body;
      } else {
        try {
          result += JSON.stringify(this.body);
        } catch (e) {
          //
        }
      }
    }
    return result;
  }

  genResponse(sendHandler : SendHandler) {
    return new AzWsResponse(sendHandler, AzWsMessage, {
      status: 200,
      lightMsg: 'OK',
      method: 'RESPONSE',
      path: this.path,
      msgId: this.msgId,
    });
  }
}
