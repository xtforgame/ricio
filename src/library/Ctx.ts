import { Body, Status, LightMsg } from './ws/index';

export interface RcResponse {
  send(body : Body, cb : Function) : any;
  sendPromise(body : Body) : Promise<any>;
  throw(status : Status, message : LightMsg, optioins : Object) : any;
}

export interface ICtx<RcPeer> {
  rcPeer: RcPeer | void;
  rcResponse: RcResponse;
  request: any;
  body : Body;
  throw: (status : Status, message : LightMsg, optioins : Object) => void;
}
