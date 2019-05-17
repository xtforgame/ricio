import ws from 'ws';
import RicioPeer, { IRcPeerManager } from '../RicioPeer';
import { EmptyWsPeerManager, IWsPeer, IWsPeerManager } from '~/WsPeer';
import { ICtx } from '../Ctx';
declare const _default: <WsPeer extends IWsPeer = ws, WsPeerManager extends IWsPeerManager<WsPeer> = EmptyWsPeerManager<WsPeer>, RcPeer = RicioPeer<WsPeer, WsPeerManager>>(rcPeerManager: IRcPeerManager<WsPeer, WsPeerManager>, PeerClass?: typeof RicioPeer) => (ctx: ICtx<RcPeer>, next: () => Promise<any>) => Promise<any>;
export default _default;
