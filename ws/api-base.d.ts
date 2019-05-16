import { WsMessageConfig } from '../ws/index';
import { IWsPeer } from '../WsPeer';
export default class ApiBase<WsPeer extends IWsPeer, WsPeerManager = any> {
    wsPeer: WsPeer;
    wsPeerManager: WsPeerManager;
    constructor(wsPeer: WsPeer, wsPeerManager: WsPeerManager);
    open(url: string): Promise<any>;
    close(code?: number, reason?: string): Promise<any>;
    send(msgConfig: WsMessageConfig): any;
}
