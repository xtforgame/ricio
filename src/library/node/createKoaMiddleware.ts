import axios from 'axios';
import { AzWsMessage, Body, Status, LightMsg, WsMessage } from '../ws/index';
import RicioPeer, { IRicioPeer, IUserSessionManager } from '../RicioPeer';
import { ICtx } from '../Ctx';

function createContext(ctx : ICtx, rcPeer : IRicioPeer) {
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

export default (userSessionManager : IUserSessionManager, PeerClass = RicioPeer) => (ctx : ICtx, next : () => Promise<any>) => {
  const {
    'x-ricio-webhook-url': webhookUrl,
  } = ctx.request.headers;
  const rcPeer = new PeerClass(userSessionManager, {
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
  });

  createContext(ctx, rcPeer);

  return next();
};
