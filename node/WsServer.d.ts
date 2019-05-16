import { IServer } from 'ws';
import { IRicioPeerClass, IUserSessionManager } from '../RicioPeer';
import { ICtx } from '../Ctx';
export interface WsServerOntions {
    userSessionManager: IUserSessionManager;
    PeerClass: IRicioPeerClass;
}
export default class WsServer {
    callback: (ctx?: ICtx) => any;
    server: IServer;
    constructor(callback: (ctx?: ICtx) => any, options?: WsServerOntions, ...args: any[]);
    on(eventName: string, cb: Function): any;
    bind({ userSessionManager, PeerClass, }: {
        userSessionManager: IUserSessionManager;
        PeerClass: IRicioPeerClass;
    }, onError?: (ctx: ICtx) => void, onNoMatch?: (ctx: ICtx) => void): void;
}
