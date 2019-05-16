import RicioPeer, { IUserSessionManager } from '../RicioPeer';
import { ICtx } from '../Ctx';
declare const _default: (userSessionManager: IUserSessionManager, PeerClass?: typeof RicioPeer) => (ctx: ICtx, next: () => Promise<any>) => Promise<any>;
export default _default;
