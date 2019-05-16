// // [TODO] remove this line
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
export interface IRicioPeer {
}

export interface IRicioPeerClass {
  new (...args : any[]): IRicioPeer;
}

export interface IUserSessionManager {
  allPeers: any;
}

export default class RicioPeer {
  protocol : any;
  api : any;
  userSessionManager : IUserSessionManager;

  session : any;
  sessionId : any;
  managedSession : any;

  constructor(userSessionManager : IUserSessionManager, option : any) {
    if (!option.protocol) {
      throw new Error('<RicioPeer>: No option.protocol provided.');
    }
    this.protocol = option.protocol;
    this.api = option.protocol.api;
    this.userSessionManager = userSessionManager;
  }

  send = (msg : any) => this.protocol.api.send(msg)
  .catch((e : Error) => {
    console.log('RicioPeer Send Error :', e);
  });

  getWsPeer() {
    return this.api.wsPeer;
  }

  getSession() {
    return this.session;
  }

  getSessionId() {
    return this.sessionId;
  }

  setSession(managedSession : any) {
    this.managedSession = managedSession;
    this.sessionId = managedSession.uid;
    this.session = managedSession.data.session;
  }

  getUser() {
    return this.managedSession && this.managedSession.user;
  }
}
