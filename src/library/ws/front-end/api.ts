import ApiBase from '../api-base';
import { AzWsMessage, AzWsMsgBody, RawData, WsMessageConfig } from '../../ws/index';
import makeCancelable, { ICancelToken } from '../../utils/makeCancelable';

declare function setInterval(handler: TimerHandler, timeout?: number, ...arguments: any[]): number;
declare function setTimeout(handler: TimerHandler, timeout?: number, ...arguments: any[]): number;

export interface IEventEmitter {
  addListener(event: string, listener: Function): IEventEmitter;
  on(event: string, listener: Function): IEventEmitter;
  once(event: string, listener: Function): IEventEmitter;
  removeListener(event: string, listener: Function): IEventEmitter;
  removeAllListeners(event?: string): IEventEmitter;
  setMaxListeners(n: number): void;
  listeners(event: string): Function[];
  emit(event: string, ...args: any[]): boolean;
}

export interface IEventEmitterClass {
  new (...args : any[]): IEventEmitter;
}

interface PromiseInfo {
  promise: Promise<any> | null;
  isFulfilled? : boolean;
  resolve? : ((arg: any) => any);
  reject? : ((arg: any) => any);
}

interface OpenAsyncInfo extends PromiseInfo {
}

export class WebsocketApi {
  url : string;
  EventEmitter : IEventEmitterClass;
  socket : WebSocket | null;
  state : string;
  nativeEvents : IEventEmitter;
  binaryType : BinaryType;

  openAsyncInfo : OpenAsyncInfo;

  constructor(url = '', EventEmitter : IEventEmitterClass) {
    this.url = url;
    this.EventEmitter = EventEmitter;
    this.socket = null;
    this.state = 'closed';
    this.nativeEvents = new EventEmitter();
    this.binaryType = 'arraybuffer';
    this.openAsyncInfo = { promise: null };
  }

  close(code? : number, reason? : string) : Promise<any> {
    if (this.socket) {
      this.openAsyncInfo = { promise: null };
      try {
        this.socket.close(code, reason);
      } catch (error) {
        return Promise.reject(error);
      }
      this.state = 'closed';
      this.socket = null;
    }
    return Promise.resolve();
  }

  open(url? : string) : Promise<any> {
    if ((!url || this.url === url) && this.state !== 'closed') {
      return this.openAsyncInfo.promise || Promise.resolve();
    }
    this.close();
    this.state = 'connecting';
    this.url = url || this.url;
    try {
      this.socket = new WebSocket(this.url);
    } catch (error) {
      this.state = 'closed';
      return Promise.reject(error);
    }
    this.socket.binaryType = this.binaryType;
    this.socket.onopen = (evt) => {
      this.state = 'connected';
      this.nativeEvents.emit('open', evt, this);
      if (!this.openAsyncInfo.isFulfilled) {
        this.openAsyncInfo.isFulfilled = true;
        const { resolve = () => {} } = this.openAsyncInfo;
        resolve({ evt, ws: this });
      }
    };
    this.socket.onclose = (evt) => {
      this.state = 'closed';
      this.nativeEvents.emit('close', evt, this);
    };
    this.socket.onmessage = (evt) => {
      // let msg = new AzWsMessage(evt.data);
      if (evt.data instanceof ArrayBuffer) {
        this.nativeEvents.emit('message', evt, this);
      } else {
        // console.log('evt.data :', evt.data);
        this.nativeEvents.emit('message', evt, this);
      }
    };
    this.socket.onerror = (evt) => {
      this.state = 'closed';
      this.nativeEvents.emit('error', evt, this);
      if (!this.openAsyncInfo.isFulfilled) {
        this.openAsyncInfo.isFulfilled = true;
        const { reject = () => {} } = this.openAsyncInfo;
        reject({ evt, ws: this });
      }
    };

    this.openAsyncInfo.promise = new Promise((resolve, reject) => {
      Object.assign(this.openAsyncInfo, { resolve, reject, isFulfilled: false });
    });
    return this.openAsyncInfo.promise;
  }

  send(msg :  string | ArrayBufferLike | Blob | ArrayBufferView) {
    if (!this.socket) {
      return Promise.reject(new Error('No Connection'));
    }
    this.socket.send(msg);
    return Promise.resolve();
  }

  listenNative(events : string | { [s : string] : Function }, cb? : Function) {
    if (typeof events === 'string') {
      return this.nativeEvents.addListener(events, <Function>cb);
    }
    return Object.keys(events).map(event => this.nativeEvents.addListener(event, events[event]));
  }

  unlistenNative(events : string | { [s : string] : Function }, cb? : Function) {
    if (typeof events === 'string') {
      return this.nativeEvents.removeListener(events, <Function>cb);
    }
    return Object.keys(events).map(event => this.nativeEvents.removeListener(event, events[event]));
  }
}

interface LastReconnect extends PromiseInfo {
  time: number;
  count: number;
}

export type WaitResPromises = { [n: number]: any; };

export type RequestOptions = {
  timeout? : number;
  cancelToken? : ICancelToken;
};

export type WsProtocolApiOptions = {
  reconnection: boolean;
  reconnectionDelay: number;
  reconnectionAttempts: number;
};

export default class WsProtocolApi extends ApiBase<WebsocketApi> {
  EventEmitter : IEventEmitterClass;
  options : WsProtocolApiOptions;
  events : IEventEmitter;
  lastReconnect : LastReconnect | null;
  waitResPromises : WaitResPromises;
  wsMsgCounter: number;

  constructor(url = '', EventEmitter : IEventEmitterClass, options : Object = {}) {
    super(new WebsocketApi(url, EventEmitter), {});
    this.EventEmitter = EventEmitter;
    this.options = Object.assign({
      reconnection: true,
      reconnectionDelay: 5000,
      reconnectionAttempts: 12,
    }, options);
    this.lastReconnect = null;
    this.events = new EventEmitter();
    this.waitResPromises = {};
    this.wsMsgCounter = new Date().getTime();

    const x = this.wsPeer;

    this.wsPeer.listenNative({
      message: this.wsOnMessage,
      error: () => {},
      close: () => {},
    });
  }

  get nativeEvents() {
    return this.wsPeer.nativeEvents;
  }

  stopReconnect(reason : any) {
    if (this.lastReconnect) {
      if (this.lastReconnect.reject) {
        this.lastReconnect.reject(reason);
      }
      this.lastReconnect = null;
    }
  }

  reconnect(url : string) : Promise<any> {
    if (this.lastReconnect && this.lastReconnect.promise) {
      return this.lastReconnect.promise;
    }

    this.lastReconnect = this.lastReconnect || {
      time: new Date().getTime(),
      count: 0,
      promise: null,
    };

    this.lastReconnect.time = new Date().getTime();
    this.lastReconnect.count++;
    const p : Promise<any> = this.lastReconnect.promise = (
      this.lastReconnect.promise || Promise.resolve()
    );
    delete this.lastReconnect;

    // console.log('this.lastReconnect.time :', this.lastReconnect.time);

    return p.then(() => {
      return this._open(url);
    })
    .then(() => {
      this.lastReconnect = null;
    })
    .catch(() => {
      return new Promise((resolve, _reject) => {
        if (!this.lastReconnect) {
          const message = 'Reconnection interrupted';
          this.events.emit('disconnect', {
            message,
            reason: message,
          });
          return _reject();
        }

        if (this.lastReconnect.count > this.options.reconnectionAttempts) {
          const message = 'Reconnection limit exceeded';
          this.events.emit('disconnect', {
            message,
            reason: message,
          });
          return _reject();
        }

        let timeout : number = 0;
        const reject = () => {
          clearTimeout(timeout);
          _reject();
        };
        timeout = setTimeout(resolve, this.options.reconnectionDelay);
        this.lastReconnect.reject = reject;
      })
      .then(() => {
        this.lastReconnect && (this.lastReconnect.promise = null);
        return this.reconnect(url);
      });
    });
  }

  open(url : string) : Promise<any> {
    return this.reconnect(url);
  }

  _open(url : string) : Promise<any> {
    return this.wsPeer.open(url).then(() => this);
  }

  close() {
    const message = 'Normal';
    const evt = {
      reason: message,
      message,
    };
    return this.wsPeer.close()
    .then(() => {
      this.events.emit('disconnect', evt);
    })
    .catch((e : Error) => {
      this.events.emit('disconnect', evt);
      throw e;
    });
  }

  request(msgConfig : WsMessageConfig, options : RequestOptions = {}) {
    return this.sendAndWaitResponse(msgConfig, options);
  }

  sendAndWaitResponse(msgConfig : WsMessageConfig, { timeout = 30000, cancelToken } : RequestOptions = {}) {
    const msgId = ++this.wsMsgCounter;
    const config = Object.assign({}, msgConfig, { msgId });
    const msg = new AzWsMessage(config);
    // console.log('msg.build() :', msg.build());
    const cancelable = makeCancelable(new Promise((resolve, reject) => {
      this.waitResPromises[msgId] = { resolve, reject };
      this.wsPeer.send(msg.build());
    }), cancelToken);

    setTimeout(() => {
      cancelable.cancel(`Request Timeout after ${timeout}ms`);
    }, timeout);

    return cancelable.promise;
  }

  wsOnMessage = ({ data: rawData } : { data: RawData }, ws : any) => {
    const wsMsg = new AzWsMessage({ rawData });
    (<AzWsMsgBody>wsMsg.body).json().then((data) => {
      const evt = { rawData, wsMsg, data };
      this.events.emit('message', evt);
      if (wsMsg.method === 'RESPONSE' && (wsMsg.msgId in this.waitResPromises)) {
        this.events.emit('response', evt);
        if (!evt.wsMsg.status || evt.wsMsg.status < 200 || evt.wsMsg.status >= 400) {
          const error = {
            response: evt,
          };
          this.waitResPromises[wsMsg.msgId].reject(error);
        }else {
          this.waitResPromises[wsMsg.msgId].resolve(evt);
        }
        delete this.waitResPromises[wsMsg.msgId];
      } else {
        this.events.emit('send', evt);
      }
    });
  }
}
