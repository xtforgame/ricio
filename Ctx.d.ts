import { Body, Status, LightMsg } from './ws/index';
import { IRicioPeer } from './RicioPeer';
export declare type RcPeer = IRicioPeer | null | undefined;
export interface RcResponse {
    send(body: Body, cb: Function): any;
    sendPromise(body: Body): Promise<any>;
    throw(status: Status, message: LightMsg, optioins: Object): any;
}
export interface ICtx {
    rcPeer: RcPeer;
    rcResponse: RcResponse;
    request: any;
    body: Body;
    throw: (status: Status, message: LightMsg, optioins: Object) => void;
}
