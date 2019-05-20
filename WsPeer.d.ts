import ws from 'ws';
export interface IWsPeer {
    send(...args: any[]): any;
}
export interface IWsPeerManager<WsPeer extends IWsPeer = ws> {
    wsPeerMap: Map<any, WsPeer>;
}
export declare class EmptyWsPeerManager<WsPeer> {
    wsPeerMap: Map<any, WsPeer>;
    constructor();
}
export declare class EmptyWsPeer {
    send(...args: any[]): any;
}
