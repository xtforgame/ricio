import ws from 'ws';
import RicioPeer, { IRcPeerManager } from '../RicioPeer';
import { EmptyWsPeerManager, IWsPeer, IWsPeerManager } from '~/WsPeer';
import { AzWsMessageCtx } from '~/ws/server/api';
declare const _default: <WsPeer extends IWsPeer = ws, WsPeerManager extends IWsPeerManager<WsPeer> = EmptyWsPeerManager<WsPeer>, RcPeer = RicioPeer<WsPeer, WsPeerManager>>(rcPeerManager: IRcPeerManager<WsPeer, WsPeerManager>, PeerClass?: typeof RicioPeer) => (ctx: AzWsMessageCtx<RcPeer>, next: () => Promise<any>) => Promise<any>;
export default _default;
