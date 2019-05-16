import { Server, IServer } from 'ws';
import { RawData } from '../ws';
import RicioPeer, { IRicioPeer, IRicioPeerClass, IUserSessionManager } from '../RicioPeer';
import WsProtocolApi, { AzWsMessageCtx, IServerWsPeer } from '../ws/server/api';
import { ICtx } from '../Ctx';

function createContext(
  server : any,
  ws : IServerWsPeer,
  rcPeer : IRicioPeer,
  {
    method,
    peerInfo: _peerInfo = {},
    rawData = null,
    ...options
  }: { method: string, rawData?: RawData, peerInfo?: Object }
) : ICtx {
  const peerInfo = {
    ..._peerInfo,
    server,
    ws,
    userData: { rcPeer },
  };

  const msg = new AzWsMessageCtx({
    path: rawData ? undefined : '/',
    rawData,
    ...options,
    peerInfo,
  });

  msg.rcPeer = rcPeer;
  const send = (data : Body) : Promise<any> => new Promise((resolve, reject) => {
    const cb = (error : Error) => {
      if (error) {
        return reject(error);
      }
      return resolve(null);
    };
    ws.send(data, cb);
  });
  msg.rcResponse = /* msg.rcPeer.response || */ msg.rcResponse || msg.genResponse({
    send,
    sendPromise: send,
  });
  return msg;
}

export interface WsServerOntions {
  userSessionManager : IUserSessionManager;
  PeerClass : IRicioPeerClass,
}

export default class WsServer {
  callback: (ctx? : ICtx) => any;
  server : IServer;

  constructor(
    callback: (ctx? : ICtx) => any,
    options : WsServerOntions = { userSessionManager: { allPeers: null }, PeerClass: RicioPeer },
    ...args : any[]
  ) {
    this.callback = callback;
    this.server = new Server(...args);
    this.bind(options);
  }

  on(eventName : string, cb : Function) {
    return this.server.on(eventName, cb);
  }

  bind(
    {
      userSessionManager,
      PeerClass = RicioPeer,
    }: {
      userSessionManager : IUserSessionManager,
      PeerClass : IRicioPeerClass,
    },
    onError = ((ctx : ICtx) => {}),
    onNoMatch = ((ctx : ICtx) => {})
  ) {
    this.on('connection', (wsObj : IServerWsPeer) => {
      const rcPeer = new PeerClass(userSessionManager, {
        protocol: {
          type: 'ws',
          api: new WsProtocolApi(wsObj, userSessionManager.allPeers),
        },
      });

      wsObj.on('open', () => {
        const ctx = createContext(this, wsObj, rcPeer, {
          method: 'OPEN',
        });
        this.callback(ctx);
      });

      wsObj.on('message', (data : RawData) => {
        let ctx = createContext(this, wsObj, rcPeer, {
          method: 'MESSAGE',
          peerInfo: { data },
        });
        // this.callback(ctx);

        ctx = createContext(this, wsObj, rcPeer, {
          method: '',
          rawData: data,
          peerInfo: { data },
        });

        this.callback(ctx);
      });

      wsObj.on('close', (code? : number, reason? : string) => {
        const ctx = createContext(this, wsObj, rcPeer, {
          method: 'CLOSE',
          peerInfo: { code, reason },
        });
        this.callback(ctx);
      });

      wsObj.on('error', (error : Error) => {
        const ctx = createContext(this, wsObj, rcPeer, {
          method: 'ERROR',
          peerInfo: { error },
        });
        this.callback(ctx);
      });

      const ctx = createContext(this, wsObj, rcPeer, {
        method: 'CONNECT',
      });
      this.callback(ctx);
    });
  }
}
