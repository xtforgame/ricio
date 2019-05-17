import ws, { IServer } from 'ws';
import RicioPeer, { IRcPeerClass, IRcPeerManager } from '../RicioPeer';
import { EmptyWsPeerManager, IWsPeer, IWsPeerManager } from '~/WsPeer';
import { AzWsMessageCtx } from '../ws/server/api';
export interface WsServerOptions<WsPeer extends IWsPeer = ws, WsPeerManager extends IWsPeerManager<WsPeer> = EmptyWsPeerManager<WsPeer>> {
    rcPeerManager: IRcPeerManager<WsPeer, WsPeerManager>;
    PeerClass: IRcPeerClass;
}
export default class WsServer<WsPeer extends IWsPeer = ws, WsPeerManager extends IWsPeerManager<WsPeer> = EmptyWsPeerManager<WsPeer>, RcPeer = RicioPeer<WsPeer, WsPeerManager>> {
    callback: (ctx?: AzWsMessageCtx<RcPeer>) => any;
    server: IServer;
    constructor(callback: (ctx?: AzWsMessageCtx<RcPeer>) => any, options: WsServerOptions<WsPeer, WsPeerManager>, ...args: any[]);
    on(eventName: string, cb: Function): any;
    bind({ rcPeerManager, PeerClass, }: {
        rcPeerManager: IRcPeerManager<WsPeer, WsPeerManager>;
        PeerClass: IRcPeerClass;
    }, onError?: (ctx: AzWsMessageCtx<RcPeer>) => void, onNoMatch?: (ctx: AzWsMessageCtx<RcPeer>) => void): void;
}
