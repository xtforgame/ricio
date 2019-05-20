import { WsMessageConfig } from '../ws/index';
import { IWsPeer } from '../WsPeer';
export interface IWsProtocolApi<WsPeer extends IWsPeer, WsPeerManager = any> {
    wsPeer: WsPeer;
    wsPeerManager: WsPeerManager;
    open(url: string): Promise<any>;
    close(code?: number, reason?: string): Promise<any>;
    send(msgConfig: WsMessageConfig): any;
}
export default class WsProtocolApiBase<WsPeer extends IWsPeer, WsPeerManager = any> implements IWsProtocolApi<WsPeer, WsPeerManager> {
    wsPeer: WsPeer;
    wsPeerManager: WsPeerManager;
    constructor(wsPeer: WsPeer, wsPeerManager: WsPeerManager);
    open(url: string): Promise<any>;
    close(code?: number, reason?: string): Promise<any>;
    send(msgConfig: WsMessageConfig): any;
}
