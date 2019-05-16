import ws from 'ws';
import { AzWsMessage, WsMessageConfig, Status } from '../../ws/index';
import ApiBase from '../api-base';
import { IWsPeer } from '../../WsPeer';
import RicioPeer, { IRicioPeer } from '../../RicioPeer';
import { RcPeer } from '../../Ctx';
export declare class AzWsMessageCtx<PeerClass extends IRicioPeer = RicioPeer> extends AzWsMessage {
    rcPeer: RcPeer;
    rcResponse: any;
    request: any;
    constructor(config: WsMessageConfig);
    throw: (status: Status, message: string | null, optioins: Object) => void;
}
export interface IServerWsPeer extends IWsPeer {
    emit(eventName: string, ...args: any[]): any;
    on(eventName: string, cb: Function): any;
    close(code?: number, reason?: string): any;
}
declare class WsProtocolApi<WsPeer extends IServerWsPeer = ws> extends ApiBase<WsPeer> {
    open(url: string): Promise<this>;
    send(msgConfig: WsMessageConfig): Promise<{}>;
    close(code?: number, reason?: string): Promise<any>;
}
export default WsProtocolApi;
