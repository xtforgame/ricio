import ws, { IServer } from 'ws';
import RicioPeer, { IRcPeerClass, IRcPeerManager } from '../RicioPeer';
import { EmptyWsPeerManager, IWsPeer, IWsPeerManager } from '~/WsPeer';
import { ICtx } from '../Ctx';
export interface WsServerOptions<WsPeer extends IWsPeer = ws, WsPeerManager extends IWsPeerManager<WsPeer> = EmptyWsPeerManager<WsPeer>> {
    rcPeerManager: IRcPeerManager<WsPeer, WsPeerManager>;
    PeerClass: IRcPeerClass;
}
export default class WsServer<WsPeer extends IWsPeer = ws, WsPeerManager extends IWsPeerManager<WsPeer> = EmptyWsPeerManager<WsPeer>, RcPeer = RicioPeer<WsPeer, WsPeerManager>> {
    callback: (ctx?: ICtx<RcPeer>) => any;
    server: IServer;
    constructor(callback: (ctx?: ICtx<RcPeer>) => any, options: WsServerOptions<WsPeer, WsPeerManager>, ...args: any[]);
    on(eventName: string, cb: Function): any;
    bind({ rcPeerManager, PeerClass, }: {
        rcPeerManager: IRcPeerManager<WsPeer, WsPeerManager>;
        PeerClass: IRcPeerClass;
    }, onError?: (ctx: ICtx<RcPeer>) => void, onNoMatch?: (ctx: ICtx<RcPeer>) => void): void;
}
