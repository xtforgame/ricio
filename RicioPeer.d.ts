export interface IRicioPeer {
}
export interface IRicioPeerClass {
    new (...args: any[]): IRicioPeer;
}
export interface IUserSessionManager {
    allPeers: any;
}
export default class RicioPeer {
    protocol: any;
    api: any;
    userSessionManager: IUserSessionManager;
    session: any;
    sessionId: any;
    managedSession: any;
    constructor(userSessionManager: IUserSessionManager, option: any);
    send: (msg: any) => any;
    getWsPeer(): any;
    getSession(): any;
    getSessionId(): any;
    setSession(managedSession: any): void;
    getUser(): any;
}
