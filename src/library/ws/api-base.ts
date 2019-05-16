import { AzWsMessage, WsMessageConfig, Url } from '../ws/index';
import { IRicioPeer } from '../RicioPeer';
import { IWsPeer } from '../WsPeer';

export default class ApiBase<WsPeer extends IWsPeer, WsPeerManager = any> {
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
