import ws from 'ws';
import axios from 'axios';
import RicioPeer, { IRcPeerManager } from '../RicioPeer';
import { EmptyWsPeerManager, IWsPeer, IWsPeerManager } from '../WsPeer';
import { Body, Status, LightMsg, WsMessage } from '../ws/index';
import { AzWsMessageCtx } from '../ws/server/api';

function createContext<RcPeer>(ctx : AzWsMessageCtx<RcPeer>, rcPeer : RcPeer) {
  ctx.rcPeer = rcPeer;
  ctx.rcResponse = {
    send: (body : Body) => {
      ctx.body = body;
    },
    sendPromise: (body : Body) => {
      ctx.body = body;
      return Promise.resolve();
    },
    throw: (status : Status, message : LightMsg, optioins : Object) => {
      ctx.throw(status, message, optioins);
    },
  };
  return ctx;
}

export default <
  WsPeer extends IWsPeer = ws,
  WsPeerManager extends IWsPeerManager<WsPeer> = EmptyWsPeerManager<WsPeer>,
  RcPeer = RicioPeer<WsPeer, WsPeerManager>
>(
  rcPeerManager : IRcPeerManager<WsPeer, WsPeerManager>,
  PeerClass = RicioPeer,
) => (
  ctx : AzWsMessageCtx<RcPeer>, next : () => Promise<any>,
) => {
  const {
    'x-ricio-webhook-url': webhookUrl,
  } = ctx.request.headers;
  const rcPeer = <RcPeer><any>new PeerClass<WsPeer, WsPeerManager>(
    rcPeerManager,
    {
      protocol: {
        type: 'http',
        api: {
          send: (msg : WsMessage) => {
            if (!webhookUrl) {
              return Promise.reject(new Error('No "x-ricio-webhook-url" header provided'));
            }
            return axios({
              method: 'post',
              url: webhookUrl,
              data: msg.body,
            })
            .then((res : any) => res.data);
          },
        },
      },
    }
  );

  createContext<RcPeer>(ctx, rcPeer);

  return next();
};
