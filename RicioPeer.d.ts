import ws from 'ws';
import { WsMessageConfig } from './ws/index';
import { IWsProtocolApi } from './ws/api-base';
import { IWsPeer } from './WsPeer';
export interface IWsProtocol<WsPeer extends IWsPeer, WsPeerManager = any> {
    type: string;
    api: IWsProtocolApi<WsPeer, WsPeerManager>;
}
export interface IRicioPeer {
}
export interface IRicioPeerClass {
    new (...args: any[]): IRicioPeer;
}
export interface IUserSessionManager {
    allPeers: any;
}
export default class RicioPeer<WsPeer extends IWsPeer = ws, WsPeerManager = any> {
    protocol: IWsProtocol<WsPeer, WsPeerManager>;
    api: IWsProtocolApi<WsPeer, WsPeerManager>;
    userSessionManager: IUserSessionManager;
    session: any;
    sessionId: any;
    managedSession: any;
    constructor(userSessionManager: IUserSessionManager, option: any);
    send: (msg: WsMessageConfig) => any;
    getWsPeer(): WsPeer;
    getSession(): any;
    getSessionId(): any;
    setSession(managedSession: any): void;
    getUser(): any;
}
