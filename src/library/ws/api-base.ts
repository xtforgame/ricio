import { AzWsMessage, WsMessageConfig, Url } from '../ws/index';
import { IRcPeer } from '../RicioPeer';
import { IWsPeer } from '../WsPeer';

export interface IWsProtocolApi<WsPeer extends IWsPeer, WsPeerManager = any> {
  wsPeer : WsPeer;
  wsPeerManager : WsPeerManager;

  open(url : string) : Promise<any>;

  close(code? : number, reason? : string) : Promise<any>;

  send(msgConfig : WsMessageConfig) : any;
}

export default class WsProtocolApiBase<WsPeer extends IWsPeer, WsPeerManager = any> implements IWsProtocolApi<WsPeer, WsPeerManager> {
  wsPeer : WsPeer;
  wsPeerManager : WsPeerManager;

  constructor(wsPeer : WsPeer, wsPeerManager : WsPeerManager) {
    this.wsPeer = wsPeer;
    this.wsPeerManager = wsPeerManager;
  }

  open(url : string) : Promise<any> {
    return Promise.reject(new Error('Not implemented'));
  }

  close(code? : number, reason? : string) : Promise<any> {
    return Promise.reject(new Error('Not implemented'));
  }

  send(msgConfig : WsMessageConfig) {
    const config = Object.assign({}, msgConfig, { method: 'SEND' });
    const msg = new AzWsMessage(config);
    return this.wsPeer.send(msg.build());
  }
}
