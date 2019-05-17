import ws from 'ws';
import { WsMessageConfig } from './ws/index';
import { IWsProtocolApi } from './ws/api-base';
import { IWsPeer, IWsPeerManager, EmptyWsPeerManager } from './WsPeer';
export interface IWsProtocol<WsPeer extends IWsPeer = ws, WsPeerManager extends IWsPeerManager<WsPeer> = EmptyWsPeerManager<WsPeer>> {
    type: string;
    api: IWsProtocolApi<WsPeer, WsPeerManager>;
}
export interface IRcPeer<WsPeer, WsPeerManager> {
}
export interface IRcPeerClass {
    new <WsPeer, WsPeerManager>(...args: any[]): IRcPeer<WsPeer, WsPeerManager>;
}
export interface IRcPeerManager<WsPeer extends IWsPeer = ws, WsPeerManager extends IWsPeerManager<WsPeer> = EmptyWsPeerManager<WsPeer>> {
    wsPeerManager: WsPeerManager;
}
export default class RicioPeer<WsPeer extends IWsPeer = ws, WsPeerManager extends IWsPeerManager<WsPeer> = EmptyWsPeerManager<WsPeer>> {
    protocol: IWsProtocol<WsPeer, WsPeerManager>;
    api: IWsProtocolApi<WsPeer, WsPeerManager>;
    rcPeerManager: IRcPeerManager<WsPeer, WsPeerManager>;
    session: any;
    sessionId: any;
    managedSession: any;
    constructor(rcPeerManager: IRcPeerManager<WsPeer, WsPeerManager>, option: any);
    send: (msg: WsMessageConfig) => any;
    getWsPeer(): WsPeer;
    getSession(): any;
    getSessionId(): any;
    setSession(managedSession: any): void;
    getUser(): any;
}