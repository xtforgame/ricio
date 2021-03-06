import ws from 'ws';
import { WsMessageConfig } from './ws/index';
import { IWsProtocolApi } from './ws/api-base';
import { IWsPeer, IWsPeerManager, EmptyWsPeerManager } from './WsPeer';

export interface IWsProtocol<WsPeer extends IWsPeer = ws, WsPeerManager extends IWsPeerManager<WsPeer> = EmptyWsPeerManager<WsPeer>> {
  type: string;
  api: IWsProtocolApi<WsPeer, WsPeerManager>;
}

export interface IRcPeer<WsPeer extends IWsPeer, WsPeerManager extends IWsPeerManager<WsPeer>> {
  send(msg : WsMessageConfig) : Promise<any>;
  getWsPeer() : WsPeer;
}

export interface IRcPeerClass {
  new <WsPeer extends IWsPeer, WsPeerManager extends IWsPeerManager<WsPeer>>(...args : any[]): IRcPeer<WsPeer, WsPeerManager>;
}

export interface IRcPeerManager<WsPeer extends IWsPeer = ws, WsPeerManager extends IWsPeerManager<WsPeer> = EmptyWsPeerManager<WsPeer>> {
  wsPeerManager: WsPeerManager;
}

// export class EmptyRcPeerManager<WsPeer extends IWsPeer = ws, WsPeerManager extends IWsPeerManager<WsPeer> = EmptyWsPeerManager<WsPeer>> {
//   wsPeerManager : WsPeerManager;
//   constructor() {
//     this.wsPeerManager = new EmptyWsPeerManager<WsPeer>();
//   }
// }

export default class RicioPeer<WsPeer extends IWsPeer = ws, WsPeerManager extends IWsPeerManager<WsPeer> = EmptyWsPeerManager<WsPeer>> {
  protocol : IWsProtocol<WsPeer, WsPeerManager>;
  api : IWsProtocolApi<WsPeer, WsPeerManager>;
  rcPeerManager : IRcPeerManager<WsPeer, WsPeerManager>;

  constructor(rcPeerManager : IRcPeerManager<WsPeer, WsPeerManager>, option : any) {
    if (!option.protocol) {
      throw new Error('<RicioPeer>: No option.protocol provided.');
    }
    this.protocol = option.protocol;
    this.api = option.protocol.api;
    this.rcPeerManager = rcPeerManager;
  }

  send = (msg : WsMessageConfig) : Promise<any> => this.api.send(msg)
  .catch((e : Error) => {
    console.log('RicioPeer Send Error :', e);
  })

  getWsPeer() : WsPeer {
    return this.api.wsPeer;
  }
}
