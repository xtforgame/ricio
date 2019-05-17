import ws, { Server, IServer } from 'ws';
import { RawData } from '../ws';
import RicioPeer, { IRcPeer, IRcPeerClass, IRcPeerManager } from '../RicioPeer';
import { EmptyWsPeerManager, IWsPeer, IWsPeerManager } from '../WsPeer';
import WsProtocolApi, { AzWsMessageCtx, IServerWsPeer } from '../ws/server/api';

function createContext<RcPeer>(
  server : any,
  ws : IServerWsPeer,
  rcPeer : RcPeer,
  {
    method,
    peerInfo: _peerInfo = {},
    rawData = null,
    ...options
  }: { method: string, rawData?: RawData, peerInfo?: Object }
) : AzWsMessageCtx<RcPeer> {
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
  }, rcPeer);

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

export interface WsServerOptions<WsPeer extends IWsPeer = ws, WsPeerManager extends IWsPeerManager<WsPeer> = EmptyWsPeerManager<WsPeer>> {
  rcPeerManager: IRcPeerManager<WsPeer, WsPeerManager>;
  PeerClass : IRcPeerClass;
}

export default class WsServer<WsPeer extends IWsPeer = ws, WsPeerManager extends IWsPeerManager<WsPeer> = EmptyWsPeerManager<WsPeer>, RcPeer = RicioPeer<WsPeer, WsPeerManager>> {
  callback: (ctx? : AzWsMessageCtx<RcPeer>) => any;
  server : IServer;

  constructor(
    callback: (ctx? : AzWsMessageCtx<RcPeer>) => any,
    options : WsServerOptions<WsPeer, WsPeerManager>,
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
      rcPeerManager,
      PeerClass = RicioPeer,
    }: {
      rcPeerManager : IRcPeerManager<WsPeer, WsPeerManager>;
      PeerClass : IRcPeerClass;
    },
    onError = ((ctx : AzWsMessageCtx<RcPeer>) => {}),
    onNoMatch = ((ctx : AzWsMessageCtx<RcPeer>) => {})
  ) {
    this.on('connection', (wsObj : IServerWsPeer) => {
      const rcPeer = <RcPeer>new PeerClass<WsPeer, WsPeerManager>(rcPeerManager, {
        protocol: {
          type: 'ws',
          api: new WsProtocolApi(wsObj, rcPeerManager.wsPeerManager),
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
