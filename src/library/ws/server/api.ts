import ws from 'ws';
import { AzWsMessage, WsMessageConfig, Status, LightMsg } from '../../ws/index';
import WsProtocolApiBase from '../api-base';
import { IWsPeer } from '~/WsPeer';
import { ICtx } from '~/Ctx';

export class AzWsMessageCtx<RcPeer> extends AzWsMessage implements ICtx<RcPeer> {
  rcPeer : RcPeer;
  rcResponse: any;
  request: any;

  constructor(config : WsMessageConfig, rcPeer : RcPeer) {
    super(config);
    this.rcPeer = rcPeer;
  }

  throw = (status : Status, message : LightMsg, optioins : Object) => {

  }
}

export interface IServerWsPeer extends IWsPeer {
  emit(eventName : string, ...args : any[]) : any;
  on(eventName : string, cb : Function) : any;
  close(code? : number, reason? : string) : any;
}

class WsProtocolApi<WsPeer extends IServerWsPeer = ws> extends WsProtocolApiBase<WsPeer> {
  open(url : string) {
    return Promise.resolve(this);
  }

  send(msgConfig : WsMessageConfig) {
    const config = Object.assign({}, msgConfig, { method: 'SEND' });
    const msg = new AzWsMessage(config);
    return new Promise((resolve, reject) => {
      this.wsPeer.send(msg.build(), (error : Error) => {
        if (error) {
          try {
            this.wsPeer.emit('error', error);
            // this.wsPeer.close(1005, 'Unable to send data'); // the `ws` pcakage treat 1005 as an invalid code for input
            this.wsPeer.close(3005, 'Unable to send data');
          } catch (error) {
            return reject(error);
          }
          return reject(error);
        }
        return resolve();
      });
    });
  }

  close(code? : number, reason? : string) : Promise<any> {
    if (this.wsPeer) {
      try {
        this.wsPeer.close(code, reason);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  }
}

export default WsProtocolApi;
